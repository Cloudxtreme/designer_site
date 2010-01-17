/*
 * Material Experience - History Manager Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var HistoryManager = Class.create();
Object.extend(HistoryManager.prototype, 
{
	/*
	 * Sets up the history storage array and initializes the last 
	 * event to nothing.
	 */
	initialize: function() 
	{
		this.historyStore = $H();
		this.lastEvent    = null;
	},
	
	/*
	 * Clears the window hash. Generally called when a card closes.
	 */
	clearHash: function() 
	{
		window.location.hash = '#';
	},
	
	/*
	 * Register an event with the history manager. Also updates the
	 * window hash to reflect the event. This is the only way to 
	 * register an event with the history manager.
	 */
	registerEvent: function(type, title, url) 
	{
		window.location.hash = '#' + type + url;
		
		// If you don't set this explicitly IE will show the hash as
		// the document title.
		document.title = Strings.appTitle;
		
		this.lastEvent = '#' + type + url;
		this.historyStore[type + url] = title;
		
		return this;
	},
	
	/*
	 * Stops polling the URL for new events.
	 */
	stopPolling: function() 
	{
		this.poller.stop();

		return this;
	},

	/*
	 * Starts polling the URL for new events and will execute the event
	 * handler if an event occurs.
	 */
	pollEvents: function() 
	{
		this.poller = new PeriodicalExecuter(function() 
		{
			// Make sure there is a valid hash and it is NOT the card
			// that we just loaded (prevent double-carding)
			if (
				this.lastEvent != window.location.hash 	&&
				window.location.hash != '#'             && 
				window.location.hash != ''
			) {
				this.lastEvent = window.location.hash;
				this._handleEvents();
			}
		}.bind(this), 0.1);
		
		return this;
	},
	
	/*
	 * Handles an event, this is called internally by the pollEvents function
	 * when a new event occurs and should never be called directly.
	 */
	_handleEvents: function() 
	{	
		// Breaks down the event type and parameters from the hash
		var evtTypes   = /^(card|table|preview)/;
		var hash       = window.location.hash;
		
		// When IE does the split it only returns one array element,
		// the parameter, so we have to do a little magic to match
		// the action too. All other browsers seem to work correctly.
		var fullEvt    = hash.substr(1, hash.length).split(evtTypes).without('');
		var eventType  = (fullEvt.length == 1) ? hash.substr(1, hash.length).match(evtTypes)[0] : fullEvt[0];
		var eventParam = (fullEvt.length == 1) ? fullEvt : fullEvt[1];
		
		// Hide the current card if there is one
		if (SME.currentCard && SME.currentCard.hide)
		{
			SME.currentCard.hide();
		}
		
		switch (eventType) 
		{
			case 'table': 
				CardTable.showTable(eventParam);
				return;
				break;
			
			case 'card':
				theURL = SME.url.cards.evaluate({card: eventParam});
				break;
			
			case 'preview':
				theURL = SME.url.cardPreview.evaluate({card: eventParam});
				this.stopPolling();
				break;
			
			default:
				return;
				break;
		}
		
		new Ajax.Request(theURL, 
		{ 
			method: 'get',
			
			onSuccess: function(transport) 
			{
				var data = transport.responseText.cleanJSON().evalJSON();
				
				var card = new Card(
				{
					color:   CardTable.tableColor(data.type), 
					contID:  eventParam, 
					title:   data.title,
					preview: (eventType == 'preview') ? true : false 
				});
				
				this.registerEvent(eventType, data.title, eventParam);
				card.show();
			}.bind(this)
		});
	},


	/*
	 * Creates and populates the history dropdown based on the 
	 * events stored in the history storage array. Also handles
	 * showing, hiding and positioning that menu.
	 */
	getDropDown: function(x, y) 
	{
		var dropdown = $('history');
		
		// If no x and y then position the menu for the my history
		// dropdown from the tools menu.
		x = x ? x : 20;
		y = y ? y : 26;
		
		// Remove and re-append the menu from the DOM, this prevents
		// IE z-index bugs.
		document.body.appendChild(dropdown.remove());
		dropdown.innerHTML = '';
		
		//  Populate the menu
		this.historyStore.each(function(item) 
		{
			dropdown.appendChild(Builder.node('li', {}, Builder.node('a', { href: '#' + item.key }, item.value)));
		});
		
		// Initially show the menu
		dropdown.addClassName('hovered');
		
		// Must explicitly set left to nothing otherwise positioning 
		// is wrong.
		dropdown.setStyle(
		{
			right:  x + 'px',
			top:    y + 'px',
			left:   '',
			zIndex: 9999
		});

		// Hide the menu when the user...
		$H({
			'#history a' : 'click',     // Clicks on a link
			'div.table'  : 'mouseover', // Mouses-off onto a table
			'p'          : 'mouseover', // Mouses-off onto a paragraph
			'iframe'     : 'mouseover', // Mouses-off onto an iframe
			'img'        : 'mouseover'  // Mouses-off onto an image
		}).each(function(aitem)
		{
			$$(aitem.key).each(function(item) 
			{
				item.observe(aitem.value, function() 
				{
					if ($('history').hasClassName('hovered'))
					{
						$('history').removeClassName('hovered');
					}
				});
			});
		});
	}
});