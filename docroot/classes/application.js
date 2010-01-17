/*
 * Material Experience - Main Application Code
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * Core application code that is responsible for starting up the application
 * and initializing the core objects.
 */

/*
 * Register global actions for AJAX responders.
 */
Ajax.Responders.register(
{
	/*
	 * When an AJAX connection is created show the bezel that says 
	 * "loading data".
	 */
	onCreate: function() 
	{
		if (!SME.AJAXBezel) 
		{
			SME.AJAXBezel = new Bezel({ displayTime: 0, destroy: false }).show(Strings.loadingAnim); 
		} 
		else 
		{
			SME.AJAXBezel.show(Strings.loadingAnim);
		}
	},
	
	/*
	 * Each time a requester completes we check to see if it was the last 
	 * one, if it is then we take down the loading bezel.
	 */
	onComplete: function() 
	{
		if (Ajax.activeRequestCount == 0) 
		{
			SME.AJAXBezel.hide();
		}
	},
	
	/*
	 * When something goes wrong with loading data we die. 
	 */
	onException: function(transport, exception) 
	{
		if (SME.debug) 
		{
			console.error(exception);
		}
		
		SME.AJAXBezel.hide();
		new Bezel({ displayTime: 0 }).show(Strings.ajaxError);
	}
});

/*
 * Load the data for the card tables.
 */
function loadTables() 
{
	new Ajax.Request(SME.url.tableList, 
	{
		method: "get", 
		
		onSuccess: function(transport) 
		{
			transport.responseText.evalJSON().each(function(data) 
			{
				var windowDims = window.getDimensions();
				
				var table = new CardTable(
				{
					color:    data.color, 
					name:     data.name, 
					id:       data.tid,
					decorate: data.decorate
				});

				// Push the table onto the global table cache (see the SME namespace
				// for more information about the global table cache)
				SME.tables.push(table);

				// Subtracting the max chip width and height ensures that cards don't
				// fall too far off the tables
				table.loadChipData(SME.url.cardTables, 
				{
					table: data.tid, 
					w:     windowDims.width  - (SME.sizes.chipMax.width  / 2), 
					h:     windowDims.height - (SME.sizes.chipMax.height / 2)
				}, false);
			});
			
			// Initialize the sketchbook
			SME.sketchbook = new Sketchbook();
			
			// By default show the home table. When the history manager loads for the
			// first time (after this step) it will load the right table from the URL
			// if applicable. This just ensures that a table is always displayed.
			CardTable.showTable("home");
			
			// Show the tool box in the upper right
			showToolBox();
		}
	});
	
	// Start up the history manager
	SME.history = new HistoryManager().pollEvents();
}

/*
 * Show an intro card. This function will gracefully pass if there are no 
 * intro cards to be shown.
 */
function showIntro() 
{
	new Ajax.Request(SME.url.introCards, 
	{
		method: "get", 

		onSuccess: function(transport) 
		{
			var data = transport.responseText.cleanJSON();

			// If there is no intro card then just pass
			if (data == "" || data == "\n") 
			{
				return loadTables();
			} 
			else 
			{
				data = data.evalJSON();
				
				// By default just show the first card in the
				// feed
				var myCard = data[0];
				
				// If more than one card then pick one at random
				// to display (per client requirements).
				if (data.length > 1)
				{
					myCard = data[Math.floor(1 + (data.length - 1) * Math.random())];
				}
			}

			var card = new Card(
			{
				color: SME.colors.grey,
				title: '', 
				addExtraButtons: false,
				contID: myCard,

				onFadeComplete: function() 
				{
					loadTables();
				}
			}).show();
		}
	});
}

/*
 * Show the toolbox in the upper right side of the screen.
 */
function showToolBox() 
{
	new Effect.Appear($$("div#header div.history")[0]);
	
	// On mouseover of the history link show the dropdown
	$$("div.history a.history")[0].observe("mouseover", function() 
	{
		SME.history.getDropDown();
	});
	
	// Show the login screen when the login link is clicked
	$("loginLink").observe("click", Sketchbook.showLoginScreen);
	
	// Check the login when they first hit the page, saves people logging 
	// in again
	Sketchbook.checkLogin();
}

/*
 * Main program function, this starts up the interface and does various
 * little fixups of interface elements.
 */
function main() 
{
	if (SME.debug) 
	{
		new Bezel({ displayTime: 5 }).show("Full Debug Mode is Enabled");
	}
	
	// Check the resolution at load and when the screen size changes
	window.checkResolution();
	Event.observe(window, "resize", window.checkResolution);
	
	// Show the intro card or load the tables
	if (SME.skipIntro || window.location.hash.length > 1) 
	{
		loadTables();
	} 
	else 
	{
		showIntro();
	}
	
	// Per Bryan this should be a single year if 2007 otherwise it should 
	// be a date range starting on the year that the site was released.
	if (new Date().getFullYear() > 2007) 
	{
		$("copyright").innerHTML = $("copyright").innerHTML.replace(/####/, "2007-" + 
						new Date().getFullYear());
	} 
	else 
	{
		$("copyright").innerHTML = $("copyright").innerHTML.replace(/####/, "2007");
	}
}

/*
 * Start the program up when the window loads.
 */
Event.observe(window, "load",   main);