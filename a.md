I am not allowing to update zones in any way that would change leaderboards when the map is approved (DONE)
I am not allowing to create new or delete existing leaderboards if the map is approved (DONE)
I am adding a button to manually reset a leaderboard
(
If there are big changes(?) that are needed to be done on a map, it moves back to testing
In testing, even if a map was approved before, admins/mods are allowed to update zones in a way that would affect leaderboards (?)
) All off this is just: I allow creating leaderboards when map moves back to testing (DONE)

Oh yeah, and when the map moves back to being approved it doesn't reset the leaderboards. If there are changes done that require that, it can be done manually for each leaderboard or by ticking a checkbox when uploading a map version (We don't right now, just implement the button)


Honestly I think we just have to write some logic that blocks any zone or leaderboard update that would delete a leaderboard
So then if a map was approved, both admins and submitter can update zones, but only so that it won't modify leaderboards, or if a map is in submission, or is modified by admin, it allows to add create new leaderboards, so, for example, adding a new bonus. Then, I think we allow modifying leaderboards by submitter when map is back in testing, but only in a way of hiding/ranking/unranking existing leaderboards, not deleting them. And then if a map was ever approved only admins would be able to reset leaderboards
The submitter is not responsible for leaderboards once it's been approved, besides this very rare case of wanting to add a new track 


I should allow creating (and only creating) leaderboards if map goes back to testing