# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn,storage_fn,firestore_fn
from firebase_admin import initialize_app
from storage import download_json
from db import update_ocr_bboxes

print("Starting python functions")
initialize_app()

"""File paths - ex/ "emulator/companies/mt440bQGFw4cwHyK02ZU/new-contract-inputs/20SEKIslQlZ6fWR30vWM/ApplicationForm-1-pdf-1"
"""
def parseName(s=""):
    parts=s.split("/")
    env=parts[0]
    if("companies" not in parts or "new-contract-inputs" not in parts or not env): return None
    company_i = parts.index("companies")
    company_id = parts[company_i + 1]
    contract_i = parts.index("new-contract-inputs")
    contract_id = parts[contract_i + 1]
    file_name=parts[-1]
    return {"company_id":company_id,"contract_id":contract_id,"env":env,"file_name":file_name}


@https_fn.on_request()
def echopy(req: https_fn.Request) -> https_fn.Response:
    echoarg = req.args.get("echo")
    print(f"Echo {echoarg}")
    update_ocr_bboxes()
    return https_fn.Response(echoarg)

@storage_fn.on_object_finalized()
def selectFromOcr(event: storage_fn.CloudEvent[storage_fn.StorageObjectData | None]) -> None:
    """Listens for new file uploads to be added to 
    /{env}/companies/{companyId}/{}/new-contract-inputs/{contractId}/{originalName}/app-ocr.json

    To test: 
    1. You can run create a new contract
    2. then navigate to the storage ui 
        ex/ http://localhost:4000/storage/playgroundfree.appspot.com/emulator/companies/mt440bQGFw4cwHyK02ZU/new-contract-inputs/20SEKIslQlZ6fWR30vWM/ApplicationForm-1-pdf-1
    3. Upload the app-ocr.json file again
    4. See results at the corresponding firestore location 
        ex/ http://localhost:4000/firestore/data/emulator/companies/companies/mt440bQGFw4cwHyK02ZU/contracts/20SEKIslQlZ6fWR30vWM
    """
    
    locations = parseName(event.data.name)
    if(locations is None or locations["file_name"]!="app-ocr.json"): return
    print("Process ocr", event.data.bucket, event.data.name)
    app_ocr = download_json(bucket=event.data.bucket, path=event.data.name)
    print("Successfully found ocr")
    update_ocr_bboxes({"Sample Field Name":[{"x": 0, "y": 0, "width": 0.5, "height": 0.5, "fileGsUri": "gs://...", "pageNumber": 1}]}, collection_type="contracts", company_id=locations["company_id"], contract_id=locations["contract_id"], env=locations["env"])

# /emulator/companies/companies/mt440bQGFw4cwHyK02ZU/contracts/20SEKIslQlZ6fWR30vWM
@firestore_fn.on_document_updated(document="{env}/companies/companies/{company_id}/contracts/{contract_id}")
def trainOcr(event: firestore_fn.Event[firestore_fn.DocumentSnapshot|None]):
    # TODO this is pretty hefty. Every single update procs this - an optimization may be moving the data to storage on completion and capturing that with a storage fn
    if(event is None or event.data is None or event.data.after.get("status") != "completed"): return
    print("Captured update")
    print("TODO")
    return