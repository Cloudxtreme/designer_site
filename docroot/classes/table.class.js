/*
 * Material Experience - Card Table Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var CardTable = Class.create();

Object.extend(CardTable.prototype, 
{
	/*
	 * Create the table object.
	 */
	initialize: function() 
	{
		this.options = Object.extend(
		{
			name:     'New Table',			// Table Name
			color:    SME.colors.blue,		// Table Color
			id:       null,				// Table ID
			decorate: true,                         // Draw table decorator
			onRender: Prototype.emptyFunction	// Callback function when the table renders
		}, arguments[0] || {});
		
		// Cache of the chips on the table
		this.chips = [];
		
		// Cache of table JSON data
		this.data  = null;
		
		this._createTable();
		
		// Initially resizes the window to the correct height, and keep
		// resizing it as the window changes
		this.resize();
		Event.observe(window, 'resize', function() 
		{ 
			this.resize(); 
		}.bindAsEventListener(this));
		
		if (this.options.decorate)
		{
			this._createAppDecorator();
		}
	},
	
	/*
	 * Create the table DOM object.
	 */
	_createTable: function() 
	{
		this.table = document.createElement('div');
		
		if (this.options.id)
		{
			this.table.id = this.options.id;
		}
		
		this.table.className = 'table';
		document.body.appendChild(this.table);
		
		this.options.onRender(this);	
	},
	
	/*
	 * Load the chip data from the server and cache it in the object.
	 */
	loadChipData: function(feedURL, urlParams, showAfterLoad) 
	{
		new Ajax.Request(feedURL.evaluate(urlParams), 
		{
			method: 'get', 
			
			onSuccess: function(transport) 
			{
				this.data = transport.responseText.evalJSON();

				if (showAfterLoad || this.options.id == SME.currentTable) 
					this.showChips();
			}.bind(this)
		});
	},
	
	/*
	 * Creates the decorator icon show in the footer of the user interface 
	 * which just links to a table hash and relies on the history manager 
	 * to load the appropriate table.
	 */
	_createAppDecorator: function() 
	{
		var link = Builder.node('a', 
		{ 
			href:  '#table' + this.options.id, 
			style: 'color: ' + this.options.color,
			alt:   this.options.name + ' Table',
			title: this.options.name + ' Table'
		}, 
		[
			Builder.node('img', 
			{ 
				className: 'appDecorator', 
				src:       'images/pill.gif', 
				style:     'background: ' + this.options.color 
			}),
			
			this.options.name.toUpperCase()
		]);

		$('footer').appendChild(link);
	},
	
	/*
	 * Show chips on the table once data is loaded. This function creates 
	 * and caches chip objects on the table.
	 */
	showChips: function() 
	{
		// Only load the chips once
		if (this.chipsDone || !this.data) 
		{
			return;
		}
		else
		{
			this.chipsDone = true;
		}

		this.bez = new Bezel(
		{ 
			onShow: function() 
			{
				this.data.each(function(chip) 
				{
					this.addChip(chip);
				}.bind(this));

				this.chips.each(function(chip) 
				{
					chip.animate();
				});
			}.bind(this)
		}).show(Strings.loadingNoAnim);
	},
	
	/*
	 * Remove a chip from the table.
	 */
	removeChip: function(chipContID) 
	{	
		this.chips.each(function(chip)
		{
			if (chip.options.contID == chipContID)
			{
				chip.hide();
				this.chips = this.chips.without(chip);
			}
		}.bind(this))
	},
	
	/*
	 * Add a chip to the table.
	 */
	addChip: function(data) 
	{
		var cords = Object.extend(
		{
			x:       data.x,
			y:       data.y,
			animate: true
		}, arguments[1] || {});
		
		var chip = new CardChip(
		{
			x:         cords.x,
			y:         cords.y,
			category:  data.category,
			contID:    data.cid,
			title:     data.title,
			image:     data.chip,
			locked:    data.locked || false,
			animate:   cords.animate
		});
		
		chip.addTo(this.table);
		this.chips.push(chip);
	},
	
	/*
	 * Clear out the chip cache. This function is not to be used within
	 * the code. It exists to be called manually on the command line for
	 * debugging purposes.
	 */
	_blowChips: function() 
	{
		this.chips = [];
	},
	
	/*
	 * Serialize all the chip data on the table to an object, presumably
	 * to be converted to JSON later. The object should match the output
	 * of card_table.pl
	 */
	getChipData: function() 
	{
		var data = [];
		
		this.chips.each(function(c)
		{
			data.push(c._serialize());
		});
		
		return data;
	},
	
	/*
	 * Tests if the table contains a chip with the particular content ID.
	 */
	hasChip: function(chipID) 
	{
		var chip = this.chips.find(function(item) 
		{
			if (item.options.contID == chipID) 
				return true;
				
			return false;
		});
		
		return chip ? true : false;
	},
	
	/*
	 * Changes the size of the table when the browser window is resized.
	 */
	resize: function() 
	{
		this.table.style.height = ($('footer').offsetTop - 
						$('footer').offsetHeight) + 'px';
	},
	
	/*
	 * Shows the table.
	 */
	show: function() 
	{
		this.showChips();
		SME.currentTable = this.options.id;
		this.table.style.display = 'block';
	},
	
	/*
	 * Hides the table.
	 */
	hide: function() 
	{
		this.table.style.display = 'none';
	}
});

Object.extend(CardTable, 
{
	/*
	 * Show a table and hide all others. Not the special exception for the
	 * sketchbook.
	 */
	showTable: function(table) 
	{
		SME.tables.each(function(item) 
		{
			if (item.options.id == table) 
			{
				item.show();
			} 
			else 
			{
				item.hide();
			}
		});
		
		if (table == 'sketchbook') 
		{
			SME.sketchbook.show();
		} 
		else 
		{
			SME.sketchbook.hide();
		}
	},
	
	/*
	 * Return the color as a string for a table based on table ID. Note
	 * the special exception for special case cards which are not associated
	 * with a particular table.
	 */
	tableColor: function(table) 
	{
		if (table == 'special')
		{
			return SME.colors.grey;
		}
	
		var color = SME.tables.find(function(item) 
		{
			if (item.options.id == table) 
			{
				return true;
			}
				
			return false;
		}).options.color;
		
		return color;
	}
});