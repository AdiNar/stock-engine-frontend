from datetime import datetime
import logging

import flask
from flask import Blueprint, jsonify, request
import flask_praetorian

from globals import app, db, guard
from init_db import init_db
from models import Query

api_blueprint = Blueprint(name="api", import_name=__name__, url_prefix="/api")


@api_blueprint.route("/login", methods=["POST"])
def login():
    req = flask.request.get_json(force=True)
    username = req.get("username", None)
    password = req.get("password", None)
    user = guard.authenticate(username, password)

    ret = {"access_token": guard.encode_jwt_token(user)}

    return ret, 200


@api_blueprint.route("/refresh", methods=["POST"])
def refresh():
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {"access_token": new_token}
    return ret, 200


@api_blueprint.route("/query", methods=["GET"])
@flask_praetorian.auth_required
def get_queries():
    user_id = flask_praetorian.current_user_id()

    queries = db.session.query(Query).filter_by(user_id=user_id).all()
    queries = list(map(update_mock_query_state, queries))

    return jsonify(list=queries)


@api_blueprint.route("/query/<query_id>", methods=["GET"])
@flask_praetorian.auth_required
def get_query(query_id):
    user_id = flask_praetorian.current_user_id()

    query = (
        db.session.query(Query)
        .filter_by(id=int(query_id), user_id=user_id)
        .one_or_none()
    )
    return jsonify(update_mock_query_state(query))


@api_blueprint.route("/query", methods=["POST"])
@flask_praetorian.auth_required
def add_query():
    user_id = flask_praetorian.current_user_id()

    req = flask.request.get_json(force=True)
    query_str = req.get("query", None)

    query = Query(user_id=user_id, query=query_str)
    db.session.add(query)
    db.session.commit()

    return jsonify(query)


@api_blueprint.route("/query/watch", methods=["GET"])
@flask_praetorian.auth_required
def get_watched_queries():
    user_id = flask_praetorian.current_user_id()

    queries = db.session.query(Query).filter_by(user_id=user_id, watch=True).all()
    queries = list(map(update_mock_query_state, queries))

    return jsonify(list=queries)


@api_blueprint.route("/query/watch/<query_id>", methods=["POST"])
@flask_praetorian.auth_required
def watch_query(query_id):
    user_id = flask_praetorian.current_user_id()
    watch = int(request.args.get("watch"))

    db.session.query(Query).filter_by(user_id=user_id, id=int(query_id)).update(
        {"watch": watch}
    )
    db.session.commit()

    return jsonify({"query_id": query_id, "watch": watch})


@api_blueprint.route("/query/rerun/<query_id>", methods=["POST"])
@flask_praetorian.auth_required
def rerun_query(query_id):
    user_id = flask_praetorian.current_user_id()

    db.session.query(Query).filter_by(user_id=user_id, id=int(query_id)).update(
        {"timestamp": datetime.now()}
    )
    db.session.commit()

    return jsonify({"query_id": query_id})


@api_blueprint.route("/register_fcm", methods=["POST"])
@flask_praetorian.auth_required
def register_fcm():
    user = flask_praetorian.current_user()

    req = flask.request.get_json(force=True)
    fcm_token = req.get("fcm_token", None)

    user.fcm_token = fcm_token
    db.session.commit()

    logging.info(f"User {user} registered in fcm")

    return "", 200


@api_blueprint.route("/cleanup", methods=["GET"])
def cleanup():
    init_db(app)
    return "", 200


def update_mock_query_state(query):
    time_diff = (datetime.now() - query.timestamp).total_seconds()

    if time_diff > 10:
        query.state = "DONE"
    elif time_diff > 5:
        query.state = "IN_PROGRESS"

    return query
