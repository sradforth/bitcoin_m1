// Scraper to obtain valuations around the world

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var swap = require('node-currency-swap');

var app     = express();

var url = "http://www.tradingeconomics.com/country-list/money-supply-m1";


// Add the google finance provider
var options =
{
	cache:true,
	fetchMultipleRate :false, // Use all providers
	
}
swap.addProvider(new swap.providers.GoogleFinance());
swap.addProvider(new swap.providers.EuropeanCentralBank(options));
// Add the yahoo finance provider with request timeout option in ms
//swap.addProvider(new swap.providers.YahooFinance({timeout: 2000}));


//app.get('/scrape', function(req, res)


// Get the default USD/ = 1BTC = $2100 
var currency_swap_code = "BTC/USD"; // E.g. 'USD/SAR'
var rate = swap.quoteSync({currency: currency_swap_code});
var rate_btc_usd = rate[0].value;
if( rate_btc_usd == 0 )
{
	console.log("Unable to get BTC/USD rate");
	process.exit();
}
console.log( "BTC/USD rate is:"+rate_btc_usd);


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
						/*
						if( ( country == "Vietnam" ) ||
							( country == "United Kingdom" ) )
							*/
						{
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
							var currency_code = denomination_raw.trim();
							
							// Now convert currency to BTC
							var currency_swap_code = "BTC/"+currency_code; // E.g. 'USD/SAR'
							var rate = swap.quoteSync({currency: currency_swap_code});
							var exchange_value = rate[0].value;
							if( exchange_value > 0 )
							{
								// Yes found direct BTC value in this country
							}
							else
							{
								// We couldn't find a local exchange rate so convert their value to USD and this to BTC
								var currency_swap_code = currency_code + "/USD"; // E.g. 'USD/SAR'
								var rate = swap.quoteSync({currency: currency_swap_code});
								var exchange_value_to_usd = rate[0].value;
								if( exchange_value_to_usd > 0 )
								{
									// Convert to USD
									var value_in_usd = value * exchange_value_to_usd;
									console.log("value native:"+value+" value in USD:"+value_in_usd+" exchange_value_to_usd:"+ exchange_value_to_usd);
									var value = value_in_usd;
									//value = value_in_usd / rate_btc_usd;
									exchange_value = rate_btc_usd;
								}
							}
							
							if( exchange_value > 0 )
							{
								array_data[ country ] = (value * multiplier) / exchange_value;
								console.log( "country:"+country+" value:"+value+" currency_code:"+currency_code + " exchange_value:" + exchange_value);
							}
							else
							{
								console.log("Skipping country:"+country+" because no exchange rate exists");
								exchange_value = 0;
							}
						}
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