from firebase_admin import storage
import json

def download_json(bucket="", path=""):
    f=storage.bucket(bucket).get_blob(path).download_as_text()
    return json.loads(f)