# Goals

- Map from raw <-> tokenized list <-> html and prerender on the server
  (I think to start I'll exclusively use URLs and auth around if your name is in the header, no sidebar stuff except actions)
- The tokenized list will include a document id, and each segment will have a locally unique selector - so you can use css selectors when calculating diffs from the db deltas.
- Think on how to go from raw deltas to mutate the tokenized list to the Dom, that part is much harder... or can we just brute force?
- Nail Deltas and server storage in SQL table. Pre calculate the Raw one and
- Nail a Docker image spinup and load balancer
-
