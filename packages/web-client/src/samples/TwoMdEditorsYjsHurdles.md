For learning I'm doing everything myself

- Bouncing requests - I send back what I receive frequently.
  - I'll bet the libs use all the state diff magic. So my approach is going to be encode the state vector along with the updates we bounce around. Client: 1. Receive and cache server state. 2. Apply idempotent changes. 3. The update bounces, we use the cache, calc the update we send back and launch. Thereby always syncing all clients and never duplicating requests.
- Websocket reconnections and management with react (eventually just went with a global scope ws so we don't destroy it beffore it even initiates...)
