# bitcoin_m1

This was just a quick exercise to view the M1 values of countries around the world in terms of Bitcoin.

It also shows which countries have an M1 value exceeding bitcoin's market cap.


== Install data scraper ==
    npm install
	

== To update data ===
The data can be obtained from running the index.js script in a node.js environment.
This outputs output.json file where the contents can be copied into the html file to make the static html page.

== TODO ==
Would be interesting to automate this on a cron job so each day a snapshot is created and could cycle forward/backwards through time.

The number of bitcoin in circulation is also hardcoded in the html which should probably be read from a site or simply calculated.

This project is free for anyone to expand on, only did it out of curiousity.

Have fun!
