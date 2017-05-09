// Scraper to obtain valuations around the world

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

var url = "http://www.tradingeconomics.com/country-list/money-supply-m1";




//app.get('/scrape', function(req, res)
{
	console.log( "Scraping started");
	request(url, function(error, response, html)
	{
		if(!error)
		{
			var $ = cheerio.load(html);
			
			
			//console.log("html:"+html);

			//var table_rows = $('.table-responsive').children().first().children().first().next().children();
			//var table_rows = $('.table-responsive').children().first().children().first().next();
			var table_rows = $('.table-responsive').children().first().children();
			var array_data = {};
			
			//console.log( table_rows );
			table_rows.filter( function(index,dom_row)
				{
					try
					{
						var country = $(dom_row).children().first().children().first().text().trim();
						var value = parseFloat($(dom_row).children().first().next().text().trim());
						var denomination = $(dom_row).children().first().next().next().text().trim();
						var denomination_raw = $(dom_row).children().first().next().next().next().next().next().next().text().trim();
						var multiplier = 1;
						if( denomination_raw.indexOf("Billion") >= 0)
						{
							multiplier = 1000000000;
						}
						if( denomination_raw.indexOf("Million") >= 0 )
						{
							multiplier = 1000000;
						}
						if( ( denomination_raw.indexOf("Thousand") >= 0 ) ||
							( denomination_raw.indexOf("Thousand") >= 0 ) )
						{
							multiplier = 1000;
						}
						denomination_raw = denomination_raw.replace("Billion", "");
						denomination_raw = denomination_raw.replace("Million", "");
						denomination_raw = denomination_raw.replace("Thousands", "");
						denomination_raw = denomination_raw.replace("Thousand", "");
						denomination_raw = denomination_raw.replace("Franc", "");
						denomination_raw = denomination_raw.trim();
						array_data[ country ] = value * multiplier;
						console.log( "country:"+country+" value:"+value+" denomination:"+denomination_raw );
						
					}
					catch(e)
					{
						console.log("Exception scraping item:"+index + " error:"+e);
					}
				} 
			);
			
		
			}

		fs.writeFile('output.json', JSON.stringify(array_data, null, 4), function(err){

			console.log('File successfully written!');

		})

		// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
		//res.send(array_data);

    }) ;
}
//);