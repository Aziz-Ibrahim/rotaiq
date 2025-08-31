from .base import *

DEBUG = True

SECRET_KEY = 'django-insecure-04!yasbm=)-bafj&e3x*7w5&xyqn%at040lc+ot#++%%c3qjc4'

ALLOWED_HOSTS = []

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]