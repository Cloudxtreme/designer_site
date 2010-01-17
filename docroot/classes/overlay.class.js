/*
 * Material Experience - Document Overlay Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

var Overlay = Class.create();
Object.extend(Overlay.prototype, 
{
	/*
	 * Initializes the overlay class
	 */
	initialize: function() 
	{
		this.options = Object.extend(
		{
			zIndex:       9000,			// z-index of the overlay
			background:   'white',			// Overlay color
			opacity:      0.5,			// Overlay opacity
			fadeInSpeed:  0.2,			// Fade in speed
			fadeOutSpeed: 1,			// Fade out speed
			onClick:      this.hide,		// Callback for overlay click
			onShow:       Prototype.emptyFunction,	// Callback when the overlay is shown
			onHide:       Prototype.emptyFunction	// Callback when the overlay is hidden
		}, $H(arguments[0]) || {});
		
		this._createOverlay();
	},
	
	/*
	 * Creates the actual DOM elements of the overlay.
	 */
	_createOverlay: function() 
	{	
		this.overlay = Element.extend(document.createElement('div'));
		document.body.appendChild(this.overlay);
		
		Event.observe(this.overlay, 'click', this.options.onClick.bindAsEventListener(this));
		
		this.overlay.setStyle(
		{
			backgroundColor: this.options.background,
			zIndex:          this.options.zIndex,
			height:          '100%',
			width:           '100%',
			position:        'absolute',
			display:         'none',
			top:             0,
			left:            0
		});
	},
	
	/*
	 * Displays the overlay.
	 */
	show: function() 
	{
		this._fixBody();
			
		this.options.onShow(this);
		
		new Effect.Appear(this.overlay, 
		{
			to:       this.options.opacity, 
			duration: this.options.fadeInSpeed, 
			limit:    1 
		});
	},
	
	/*
	 * Hides the overlay.
	 */
	hide: function() 
	{
		this.options.onHide(this);
		
		new Effect.Fade(this.overlay, 
		{ 
			duration: this.options.fadeOutSpeed, 
			limit:    1,
			
			afterFinish: function() 
			{
				this._fixBody(true);
			}.bind(this)
		});
	},
	
	/*
	 * Removes the overlay from the DOM
	 */
	destroy: function()
	{
		document.body.removeChild(this.overlay);
	},

	/*
	 * Fix for IE 6, sets the body height and overflow so people can not
	 * scroll beyond the overlay. Disable overflow on the body and html 
	 * so you can see the whole overlay.
	 */
	_fixBody: function(reset)
	{
		var myHeight   = reset ? '' : '100%';
		var myOverflow = reset ? '' : 'hidden';
	
		$A([document.body,document.getElementsByTagName('html')[0]]).each(function(t) 
		{
			Element.extend(t).setStyle(
			{
				height:   myHeight,
				overflow: myOverflow
			});
		});
	}
});