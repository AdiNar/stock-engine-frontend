import flask
import flask_cors
import flask_praetorian
import flask_sqlalchemy
from sqlalchemy.orm import DeclarativeMeta

app = flask.Flask(__name__)
db = flask_sqlalchemy.SQLAlchemy()
BaseModel: DeclarativeMeta = db.Model
cors = flask_cors.CORS()
guard = flask_praetorian.Praetorian()
