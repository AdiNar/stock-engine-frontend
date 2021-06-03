import os

import flask
import flask_cors
import flask_praetorian

from models import db

guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()


def init_app():
    app = flask.Flask(__name__)
    app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]
    app.config["JWT_ACCESS_LIFESPAN"] = {"hours": 24}
    app.config["JWT_REFRESH_LIFESPAN"] = {"days": 30}
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["FLASK_DB_URI"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    from models import User

    guard.init_app(app, User)
    db.init_app(app)
    cors.init_app(app)

    with app.app_context():
        db.create_all()

    return app


app = init_app()


# Api makes import statements from app, it cannot be imported at the top of the file
from api import api_blueprint  # noqa

app.register_blueprint(api_blueprint)


def run():
    app.run(host="0.0.0.0", port=int(os.environ.get("FLASK_PORT", 8008)))


if __name__ == "__main__":
    run()
