/*
 * Material Experience - Card Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var Card = Class.create();
Object.extend(Card.prototype, 
{
	/*
	 * Creates the card and appends it to the document. This does
	 * not set the content.
	 */
	initialize: function() 
	{
		this.options = Object.extend(
		{
			title:           'New Card',			// Card Title
			id:              'mycard',			// Card ID
			preview:         false,				// This is a preview card
			addExtraButtons: true,				// Add the extra buttons to non-system cards
			contID:          null,				// Content ID of the card's contents
			color:           SME.colors.blue,		// Card Color
			width:           SME.sizes.card.width,		// Card Width
			height:          SME.sizes.card.height,		// Card Height
			onClose:         Prototype.emptyFunction,	// Card Close Callback
			onFadeComplete:  Prototype.emptyFunction,	// Card Fade Completion Callback
			onFadeOutFinish: Prototype.emptyFunction	// Card Fade Out Completion Callback
		}, arguments[0] || {});
		
		// Keep track of our card chip
		this.chip = this.options.chip;
		
		// Buttons on the card frame
		this.buttons = [];

		// Create the document overlay but don't yet show it
		this.overlay = new Overlay(
		{
			onClick: function() 
			{
				this.hide(); 
			}.bind(this)
		});

		this._createCard();

		if (this.options.addExtraButtons)
		{
			this._addExtraButtons();
		}
		
		// Always add a close button
		this.addCommandButton(Strings.closeCard,'images/close.gif', function() 
		{ 
			this.hide();
		}.bind(this));
		
		this.setTitle(this.options.title);
	},
	
	/*
	 * Create the card DOM nodes.
	 */
	_createCard: function()
	{
		// Get the rounded corner generator and the coordinates of the page center
		var Rounder  = new RoundedCorners(this.options.color);
		var cardPos  = window.calcCordsToCenter(this.options.height, this.options.width);
		var slicebox = Rounder.get(Rounder.directions.top);
				
		// Intro card will flash across the screen while card builds but 
		// before fading up if display is not set to none
		this.card = Builder.node('div', 
		{ 
			id: this.options.id, 
			style: 'display: none;', 
			className: 'card' 
		});

		// Create the card header with title and button box
		slicebox.appendChild(this.title = Builder.node('span', { className: 'cardTitle' }));
		slicebox.appendChild(this.buttonbox = Builder.node('div', { className: 'buttonbox' }, 
			this.buttonLabel = Builder.node('span', { className: 'commandlabel' })
		));
		
		// Append the header and the card content area
		this.card.appendChild(slicebox);
		this.card.appendChild(Builder.node('div', { style: 'background: white; opacity: 100%;' }, 
			this.cframe = Builder.node('div')
		));
		
		// Append the bottom of the card frame and add the card to the document
		this.card.appendChild(Rounder.get(Rounder.directions.bottom));
		document.body.appendChild(this.card);
		
		// Card frame styles
		Element.extend(this.cframe).setStyle(
		{
			width:       this.options.width  - 11 + 'px',
			height:      this.options.height - 40 + 'px',
			borderLeft:  '5px solid '   + this.options.color,
			borderRight: '5px solid '   + this.options.color,
			borderTop:   '10px solid '  + this.options.color,
			position:    'relative',
			overflow:    'hidden'
		});
		
		// Card styles
		Element.extend(this.card).setStyle(
		{
			height:   this.options.height + 'px',
			width:    this.options.width  + 'px',
			top:      cardPos.top         + 'px',
			left:     cardPos.left        + 'px',
			zIndex:   9001,
			opacity:  '100%',
			display:  'none',
			position: 'absolute'
		});
		
		// Make the card draggable
		this.drag = new Draggable(this.card, 
		{ 
			handle: 'round', 
			zindex: 9001, 
			starteffect: null, 
			endeffect: null 
		});
	},

	/*
	 * Add a command button to the top right of the card.
	 */
	addCommandButton: function(title, icon, action) 
	{
		var newButton = Builder.node('img', { className: 'commandbtn', src: icon });
		
		// Show the label on mouseover
		Event.observe(newButton, 'mouseover', function() 
		{ 
			this.buttonLabel.innerHTML = title; 
		}.bindAsEventListener(this));
		
		// Hide the label on mouse out
		Event.observe(newButton, 'mouseout', function() 
		{ 
			this.buttonLabel.innerHTML = ''; 
		}.bindAsEventListener(this));
		
		// Take the action specified when the button is clicked
		Event.observe(newButton, 'click', function(event) 
		{ 
			action(event); 
		});
		
		// Add the button to the button box and cache it.
		this.buttons[title] = this.buttonbox.appendChild(newButton);
	},

	/*
	 * Removes a command button from the card.
	 */
	removeCommandButton: function(button) 
	{
		this.buttonLabel.innerHTML = '';
		this.buttonbox.removeChild(this.buttons[button]);
	},
	
	/*
	 * Sets the title of the card.
	 */
	setTitle: function(title) 
	{
		this.options.title   = title;
		this.title.innerHTML = title;
	},
	
	/*
	 * Disables the drag on the card and removes the card
	 * from the DOM.
	 */
	destroy: function() 
	{
		// Kill the drag to prevent probable memory leaks in IE
		this.drag.destroy();
		
		// Remove the card from the DOM
		document.body.removeChild(this.card);
		
		// Destroy the overlay
		this.overlay.destroy();
	},

	/*
	 * Display the card.
	 */
	show: function() 
	{
		// Track the currently active card for the history manager
		// FLAWED LOGIC: We can have multiple cards visible at the same
		// time.
		SME.currentCard = this;
		
		// Get card positioning data
		var cardPos  = window.calcCordsToCenter(this.options.height, this.options.width);
		var windSize = window.getDimensions();
		
		// Position the card
		this.card.setStyle(
		{
			top:  cardPos.top  + 'px',
			left: cardPos.left + 'px'
		});

		this._autoSetLayout();

		// Show the overlay first so it will fade in with the card
		this.overlay.show();
		
		// Fade the card in and run its fadeComplete function.
		new Effect.Appear(this.card, 
		{ 
			afterFinish: function() 
			{ 
				this.options.onFadeComplete();
			}.bind(this) 
		});
	},
	
	/*
	 * Automatically set the layout based on the content of a JSON feed
	 * if it is supplied.
	 */
	_autoSetLayout: function() 
	{
		// Fetch data only if this is not an intro card and a content
		// id has been specified.
		if (!this.options.contID) 
		{
			return;
		}
		
		// Pull the correct data if this is a preview or a real
		// card.
		if (this.options.preview) 
		{
			var theUrl = SME.url.cardPreview.evaluate({card: this.options.contID})
		} 
		else 
		{
			var theUrl = SME.url.cards.evaluate({card: this.options.contID});
		}
	
		new Ajax.Request(theUrl, 
		{ 
			method: 'get',
				
			onSuccess: function(transport) 
			{
				try 
				{
					var data = transport.responseText.cleanJSON().evalJSON();
					this.setLayout(SME.engineMapping[data.template], data);
				} 
				catch (exception) 
				{
					if (SME.debug)
					{
						console.error(exception);
					}
				
					this.setLayout(Card.Layout.Errors, '');
				}
			}.bind(this)
		});
	},
	
	/*
	 * Add extra buttons to a card. I moved this to its own private
	 * function because some cards, like system cards, don't need all 
	 * those extra buttons.
	 */
	_addExtraButtons: function() 
	{
		this.addCommandButton(Strings.addToSketchbook,'images/plus.gif', function() 
		{
			SME.sketchbook.addChip(this.options.contID);
		}.bind(this));
		
		this.addCommandButton(Strings.sendToFriend,'images/email.gif', function() 
		{
			if ($('cardFlash'))
			{
				this.flashP = $('cardFlash').up();
				this.flash  = $('cardFlash').remove();
			}
		
			var card = new Card(
			{ 
				color: SME.colors.grey, 
				title: Strings.sendToFriend,
				addExtraButtons: false,
				
				onFadeComplete: function() 
				{
					if (this.flash)
					{
						this.flashP.appendChild(this.flash);
						this.flash = null;
					}
				}.bind(this)
			});
			
			card.setLayout(Card.Layout.Special, 
			{ 
				url: SME.url.sendToFriend.evaluate(
				{ 
					durl: 'card' + encodeURI(this.options.contID), 
					title: encodeURI(this.options.title) 
				}) 
			});
			
			card.show();
		}.bind(this));
		
		this.addCommandButton(Strings.printCard, 'images/print.gif', function() 
		{
			this.layoutEngine.print();
		}.bind(this));

		// Card history ON the card was poorly designed and implemented
		// (yeah, I know) so I'm just removing it for now till I get
		// some time to re-write it.
		//
		// TODO: Re-write this
		this.addCommandButton(Strings.myHistory,'images/history.gif', function() 
		{ 
			var center = window.calcCordsToCenter(SME.sizes.card.height, SME.sizes.card.width);
			SME.history.getDropDown(center.left + 30, center.top + 13);
		});
	},
	
	/*
	 * Hides the current card but does not remove it from the DOM.
	 */
	hide: function() 
	{
		// There is no current card so unset it
		// FLAWED LOGIC: We can have multiple cards.
		SME.currentCard = null;
		
		// Fade out and subsequently destroy the card
		new Effect.Fade(this.card, 
		{ 
			afterFinish: function() 
			{ 
				this.options.onFadeOutFinish();
				this.destroy();
			}.bind(this) 
		});
		
		// FLAWED LOGIC: Multiple cards, see above.
		SME.history.clearHash();
		this.overlay.hide();
		this.options.onClose();
	},
	
	/*
	 * Sets the layout of the card using a layout engine.
	 */
	setLayout: function(layoutE, data) 
	{
		this.layoutEngine = new layoutE(this.cframe, data, this).layout();
	}
});
