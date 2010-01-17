/*
 * Material Experience - Sketchbook Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var Sketchbook = Class.create();

Object.extend(Sketchbook.prototype, 
{
	/*
	 * Initializes a new sketchbook and table.
	 */
	initialize: function() 
	{
		// Sketchbook chip data store
		this.dataStore = [];
	
		this.table = new CardTable(
		{
			color: SME.colors.grey, 
			name:  Strings.sketchbook,
			id:    'sketchbook',

			onRender: function(table)
			{
				table.table.appendChild(Builder.node('img', 
				{ 
					id:  'sbTrash', 
					src: 'images/trash_can.jpg'
				}));
				
				Droppables.add($('sbTrash'), 
				{ 
					accept: 'chip',
					
					onDrop: function(chip) 
					{
						this.removeChip(chip);
					}.bind(this)
				});
			}.bind(this)
		});
		
		this.hide();
		
		if (Sketchbook.loggedIn)
		{
			this.loadData();
		}
	
		// Be sure to save everything when the window closes
		Event.observe(window, 'unload', this.saveData.bindAsEventListener(this));
	},
	
	/*
	 * Loads sketchbook data from the server and calls a function to merge
	 * that data into the currently loaded sketchbook.
	 */
	loadData: function() 
	{
		new Ajax.Request(SME.url.sketchBookIN,
		{
			method: 'get',
			
			onSuccess: function(transport) 
			{
				this.dataStore = transport.responseText.cleanJSON().evalJSON();	
				this._mergeSketchbooks();
			}.bind(this)
		});
	},
	
	/*
	 * Merges the currently active (presumably guest) sketchbook with the 
	 * data loaded from the server. Prevents the user from losing data when
	 * they login after adding chips to a guest sketchbook.
	 */
	_mergeSketchbooks: function()
	{
		this.dataStore.each(function(chip)
		{
			if (!this.table.hasChip(chip.cid)) 
			{
				this.table.addChip(chip, { animate: false });
			}
		}.bind(this));
	},
	
	/*
	 * Add a chip to the sketchbook. This function does duplicate detection
	 * using methods provided by the CardTable class to avoid adding a chip 
	 * more than once. The function also updates the sketchbook's data
	 * store.
	 */
	addChip: function(contID) 
	{	
		if (this.table.hasChip(contID))
		{
			new Bezel().show(Strings.alreadyAddedSB);
			return;
		}
	
		new Ajax.Request(SME.url.chipResolver.evaluate({card: contID}), 
		{ 
			method: 'get',
			
			onSuccess: function(transport) 
			{
				var data     = transport.responseText.cleanJSON().evalJSON();
				var windSize = window.getDimensions();

				this.table.addChip(data,
				{
					x: Math.floor(1 + (windSize.width - 1) * Math.random()),
					y: Math.floor(1 + ((windSize.height - 120) - 1) * Math.random()),
					animate: false
				});

				// Per BS: Would like different messages if logged in or not
				if (Sketchbook.loggedIn) 
				{
					new Bezel().show(Strings.addedSketchbook); 
				} 
				else 
				{
					new Bezel({ fadeTime: 5 }).show(Strings.addedGuestSB);
				}
				
				this.saveData();
			}.bind(this)
		});
	},
	
	/*
	 * Remove a chip from the table by DOM node.
	 */
	removeChip: function(chip) 
	{
		this.table.removeChip(chip.classLink.options.contID);
		this.saveData();
	},
	
	/*
	 * Serialize the datastore and post it back to the server for safe 
	 * keeping.
	 */
	saveData: function() 
	{	
		new Ajax.Request(SME.url.sketchBook, 
		{
			method: 'post',
			asynchronous: false,
			parameters: { 'sketchbook_data': this.table.getChipData().toJSON() }
		});
	},
	
	/*
	 * Show the sketchbook table or if not logged in show a login screen.
	 */
	show: function() 
	{
		if (!Sketchbook.loggedIn) 
		{
			Sketchbook.showLoginScreen();
		} 
		else 
		{
			this.table.show();
		}
	},
	
	/*
	 * Hide the sketchbook table.
	 */
	hide: function() 
	{
		this.table.hide();
	}
});

Object.extend(Sketchbook, 
{
	// Flag to determine if the user is logged in or not.
	loggedIn: false,
	
	// Username of the logged in user.
	username: null,

	// Show the login screen in a special case card.
	showLoginScreen: function() 
	{
		var t = new Card(
		{ 
			color:           SME.colors.grey, 
			title:           Strings.pleaseLogin,
			addExtraButtons: false,
			
			onClose: function() 
			{
				Sketchbook.checkLogin();
			}
		});
		
		t.setLayout(Card.Layout.Special, { url: SME.url.loginScreen });
		t.show();
	},
	
	/*
	 * Once the user has successfully logged in do some actions to setup
	 * the user interface.
	 */
	doLoggedIn: function() 
	{
		// Assume that if your calling this function the login succeeded
		Sketchbook.loggedIn = true;
		
		$$('div.history')[0].innerHTML = 'Hello ' + Sketchbook.username + '! | ' +
		'<a href="http://santoprene.com/cgi-bin/protected/register/logout_designer.pl">' + Strings.logout + '</a> | ' +
		'<a href="#" class="manage">' + Strings.manageAccount + '</a> | ' +
		'<a href="#" class="history">' + Strings.myHistory + '</a>';
		
		// On mouseover of the history link show the dropdown.
		// We need to re-attach it here because we're changing the 
		// links (above) and that causes the DOM to lose the original 
		// event.
		$$('div.history a.history')[0].observe('mouseover', function() 
		{
			SME.history.getDropDown();
		});
		
		$$('a.manage')[0].observe('click', function(event) 
		{
			var t = new Card(
			{ 
				color: SME.colors.grey, 
				addExtraButtons: false, 
				title: Strings.manageAccount 
			});
		
			t.setLayout(Card.Layout.Special, { url: SME.url.manageAccount });
			t.show();
			
			Event.stop(event);
		});
	},
	
	/*
	 * Check that the user actually logged in.
	 */
	checkLogin: function() 
	{
		// If the site cookie doesn't exist no point even going on
		if (!$C('Site'))
		{
			return;
		}
	
		/*
		 * Site cookie is in a weird format, basically sub-cookies are
		 * separated by & signs. The username and password of the 
		 * currently logged in user is store as username:password in 
		 * the sub-cookie called cookie. Oh yeah and the 
		 * username/password pair is base64 encoded.
		 */
		var username = decodeBase64($C('Site').split('Cookie&')[1]).split(':')[0];
		Sketchbook.username = username;
		
		/*
		 * Per Andy: the username and password won't be in the cookie 
		 * (even though the cookie itself is set) if the login failed. 
		 * So lets assume that if we find a username in the appropriate 
		 * place in the cookie we can go ahead and log the user in.
		 */
		if (username) 
		{
			Sketchbook.loggedIn = true;
			Sketchbook.doLoggedIn();
			return true;
		} 
		else 
		{
			return false;
		}
	}
});