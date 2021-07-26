from globals import db, guard
from models import Query, QueryHistory, User


def init_db(app):
    with app.app_context():

        def add_user(user, password, roles):
            if db.session.query(User).filter_by(username=user).count() < 1:
                db.session.add(
                    User(
                        username=user,
                        password=guard.hash_password(password),
                        roles=roles,
                    )
                )

            db.session.commit()

        def add_by_name(username, name, clazz, **kwargs):
            user = db.session.query(User).filter_by(username=username).first()
            if db.session.query(clazz).filter_by(name=name).count() < 1:
                db.session.add(clazz(user_id=user.id, name=name, **kwargs))
            db.session.commit()

        def add_query(username, name, query):
            add_by_name(username, name, Query, query=query)

        def add_alert(username, name, query):
            add_by_name(username, name, Query, watch=True, query=query)

        for model in [User, Query, QueryHistory]:
            db.session.query(model).delete()
        db.session.commit()

        add_user("admin", "admin", roles="admin")
        add_user("user", "user", roles="")
        add_query("user", "Test query #1", "stock(close) as test1")
        add_query("user", "Test query #2", "stock(close) as test2")

        add_alert("user", "Test alert #1", "stock(close) as test3")
        add_alert("user", "Test alert #2", "stock(close) as test4")
