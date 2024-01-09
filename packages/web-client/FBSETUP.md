Things I had to do to get it working

- Setup the auth for google / email ect... in https://console.firebase.google.com/u/0/project/playgroundfree/authentication/providers
- Somehow get google auth to wrk on localhost
- In the project root (2 directories up from here) run `gsutil cors set cors.json gs://playgroundfree.appspot.com`
