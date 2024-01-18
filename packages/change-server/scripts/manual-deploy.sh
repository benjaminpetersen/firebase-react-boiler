gcloud builds submit --tag gcr.io/bp-playground/notetaker-server
gcloud run deploy --image gcr.io/bp-playground/notetaker-server