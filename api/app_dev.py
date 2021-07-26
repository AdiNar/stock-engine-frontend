import os
import tempfile

from init_db import init_db


def env_default(key, val):
    if key not in os.environ:
        os.environ[key] = val


env_default("FLASK_DB_URI", f"sqlite:///{tempfile.mkstemp()[1]}")

# We want secret to be fixed value in order to keep sessions between server restarts
env_default("FLASK_SECRET_KEY", "not_a_secret_at_all")

# Some env changes (above) must be done before this import
from app import app, db, guard, run  # noqa

app.debug = True
app.config["PROPAGATE_EXCEPTIONS"] = True


init_db(app)


if __name__ == "__main__":
    run()
