from firebase_admin import firestore

def update_ocr_bboxes(upd, collection_type="contracts",company_id="",contract_id="",env=""):
    if(collection_type!="contracts"): 
        raise Exception(f"Update doc not implemented for {collection_type}")
    if(len(company_id)==0 or len(contract_id)==0 or len(env)==0 or not (type(upd) is dict)):
        raise Exception(f"Missing args for update_ocr_bboxes")
    # /emulator/companies/companies/mt440bQGFw4cwHyK02ZU/contracts/20SEKIslQlZ6fWR30vWM
    path=f"{env}/companies/companies/{company_id}/{collection_type}/{contract_id}"
    cl=firestore.client()
    cl.document(path).update({"ocrBBoxes": upd})
