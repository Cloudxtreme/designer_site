/*
 * Material Experience - Card Chip Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var CardChip = Class.create();
Object.extend(CardChip.prototype, 
{
	/*
	 * Initializes the chip class.
	 */
	initialize: function() 
	{
		this.options = Object.extend(
		{
			x:         0,		// X coordinate of the chip
			y:         0,		// Y coordinate of the chip
			locked:    false,	// Require login to view card
			category:  null,	// Chip target category
			contID:    null,	// Chip target content ID
			title:     null,	// Chip target title
			image:     null,	// Chip image
			className: 'chip',	// Chip CSS Class Name
			animate:   true		// Animate chip onto table
		}, arguments[0] || {});
		
		this.dragged = false;
		
		this._createChip();
			
		return this;
	},
	
	/*
	 * Create the chip DOM nodes and attach events and drags as appropriate.
	 */
	_createChip: function() 
	{
		this.chip = Builder.node('img', 
		{
			src:       this.options.image,
			className: this.options.className,
			style:     'top: ' + this.options.y + 'px; left: ' + this.options.x + 'px',
			title:     this.options.title + ((this.options.locked) ? ' (protected)' : ''),
			alt:       this.options.title + ((this.options.locked) ? ' (protected)' : '')
		});
		
		// Each DOM node should have a link back to this class so we can
		// later look at a DOM node which holds no real data about the
		// object and come back here to get the data we need.
		this.chip.classLink = this;

		new Draggable(this.chip, 
		{ 
			starteffect: null, 
			endeffect:   null,
			
			change: function() 
			{ 
				// Set the dragged flag (see onClick for more information)
				this.dragged = true; 
			}.bind(this), 
			
			onEnd: function(e) 
			{
				// Ensures that cards stay on top of the stack after they are 
				// dropped. This is accomplished by determining the maximum 
				// z-index of the cards and applying max + 1 to the current 
				// chip.
				//
				// Note that we are modifying a variable used internally by 
				// Scriptaculous that is NOT part of the public API. The 
				// originalZ variable is used by Scriptaculous to record the 
				// z-index that it should return the draggable to, by 
				// incrementing this we effectively move the card up in the 
				// stack.
				//
				// Note that scriptaculous adds a z-index of 1000 when the drag 
				// starts and does not remove it till AFTER this function executes 
				// so we have to take off that extra 1000 to get the real z-index.
				e.originalZ = $$('div#' + (SME.currentTable || 'home') + ' img.chip').max(function(x) 
				{ 
					var z = parseInt(x.style.zIndex) || 0;
					return (z >= 1000) ? z - 1000 : z;
				}) + 1;
				
				// Track the X and Y coordinates of the chip
				e.element.classLink.options.x = e.element.style.left.split('px')[0];
				e.element.classLink.options.y = e.element.style.top.split('px')[0];
			}
		});
		
		Event.observe(this.chip, 'click', function() 
		{
			this.onClick();
		}.bindAsEventListener(this));			
		
		if (this.options.animate)
		{
			this._generateAnimation();
		}
	},
	
	/*
	 * Handle clicks on the chip.
	 */
	onClick: function() 
	{
		// If we recently dragged this card then do nothing. This 
		// facilitates single click DND as well as single click 
		// activation.
		if (this.dragged == true) 
		{
			this.dragged = false;
			return;
		}
		
		// If this is a locked chip and we aren't logged in then show
		// a login screen
		if (this.options.locked && !Sketchbook.loggedIn)
		{
			return Sketchbook.showLoginScreen();
		}
		
		// Disable the puff in IE because the PNG fix breaks it
		if (!Prototype.Browser.IE) 
		{
			new Effect.Puff(this.chip, 
			{
				afterFinish: function() 
				{
					new Effect.Appear(this.chip);
				}.bind(this)
			});
		}

		SME.history.registerEvent('card', this.options.title, this.options.contID);
		
		var t = new Card(
		{
			color:  CardTable.tableColor(this.options.category), 
			contID: this.options.contID, 
			title:  this.options.title,
			chip:   this
		});
		
		t.show();
	},
	
	/*
	 * Actually move the chip onto the table. This function expects the
	 * original and new coordinates to be pre-generated and stored by
	 * another function.
	 */
	animate: function() 
	{
		new Effect.Morph(this.chip, 
		{
			style: 
			{
				top:  this.newY + 'px', 
				left: this.newX + 'px' 
			}
		});
	},
	
	/*
	 * Return data about the chip in an object that matches of the format
	 * of the card table JSON feed. 
	 */
	_serialize: function() 
	{
		return {
			cid      : this.options.contID,
			title    : this.options.title,
			category : this.options.category,			
			locked   : this.options.locked,			
			x        : this.options.x,
			y        : this.options.y,
			chip     : this.options.image
		};
	},
	
	/*
	 * Generate random coordinates for and place the chip off the edge of
	 * the table to be animated in later on by a different function.
	 */
	_generateAnimation: function() 
	{
		var myRand   = Math.floor(1 + (5 - 1) * Math.random());
		var windSize = window.getDimensions();
		
		this.newX = this.options.x;
		this.newY = this.options.y;
		
		this.chip.setStyle({ position: 'absolute' });
		
		// Determine from which direction the cards will animate
		switch (myRand) 
		{
			case 1: // Top
				this.chip.setStyle(
				{ 
					top:  -(SME.sizes.chipMax.height) + 'px', 
					left: (windSize.width / 2) + 'px' 
				});
				break;
			
			case 2: // Right
				this.chip.setStyle(
				{ 
					top:  (windSize.height / 2) + 'px', 
					left: (SME.sizes.chipMax.width) + windSize.width + 'px' 
				});
				break;
			
			case 3: // Bottom
				this.chip.setStyle(
				{
					top:  (SME.sizes.chipMax.height) + windSize.height + 'px', 
					left: (windSize.width / 2) + 'px' 
				});
				break;
			
			default: // Left
				this.chip.setStyle(
				{
					top:  (windSize.height / 2) + 'px', 
					left: -(SME.sizes.chipMax.width + 40) + 'px' 
				});
				break;
		}
	},
	
	/*
	 * Add a chip DOM node to a table.
	 */
	addTo: function(table) 
	{
		table.appendChild(this.chip);
	},
	
	/*
	 * Remove the chip DOM node from the document.
	 */
	destroy: function() 
	{
		document.removeChild(this.chip);
	},	
	
	/*
	 * Show the chip.
	 */
	show: function() 
	{
		this.chip.show();
	},
	
	/*
	 * Hide the chip.
	 */
	hide: function() 
	{
		this.chip.hide();
	}
});