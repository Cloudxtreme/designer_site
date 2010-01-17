/*
 * Material Experience - Bezel Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * Notification bezel class mimics the notification bezel in BBEdit 
 * (and to a lesser extent, OS X).
 */

var Bezel = Class.create();
Object.extend(Bezel.prototype, 
{
	/*
	 * Creates the bezel HTML elements and adds them to the document body. 
	 */
	initialize: function() 
	{
		this.options = Object.extend(
		{
			background:  "black",			// Background color of the bezel
			opacity:     0.8,			// % Opacity of the bezel
			fontSize:    "2em",			// Font Size
			fadeTime:    2,				// Fade Time
			destroy:     true,			// Destroy bezel on fade out
			displayTime: 1,				// How long to display the bezel - 0 is "sticky"
			onShow:      Prototype.emptyFunction,	// After show callback
			afterHide:   Prototype.emptyFunction	// After hide callback
		}, arguments[0] || {});
	
		this.visible = false;
	
		var Rounder  = new RoundedCorners(this.options.background);
		
		this.bezel   = Element.extend(document.createElement("div"));
		this.message = Element.extend(document.createElement("div"));
		
		this.bezel.appendChild(Rounder.get(Rounder.directions.top));
		this.bezel.appendChild(this.message);
		this.bezel.appendChild(Rounder.get(Rounder.directions.bottom));
		
		document.body.appendChild(this.bezel);
		
		this.bezel.setStyle(
		{
			opacity:  this.options.opacity,
			zIndex:   9999999,
			position: "absolute",
			display:  "none",
			width:    "auto",
			cursor:   "pointer"
		});
		
		this.message.setStyle(
		{
			background: this.options.background,
			fontSize:   this.options.fontSize,
			color:      "white",
			padding:    "0px 1em",
			textAlign:  "center"
		});
		
		// IE does not properly size the bezel so we must constrain it
		if (Prototype.Browser.IE)
		{
			this.bezel.setStyle({ width: "50%" });
		}
		
		this.bezel.onclick = function() 
		{ 
			this.hide();
		}.bind(this);
	},
	
	/*
	 * Displays the notification bezel with the requested message.
	 */
	show: function(message) 
	{
		// Sets the bezel message
		this.message.innerHTML = message;
		this.visible           = true;
		
		// Center the bezel
		var mysize = this.bezel.getDimensions();
		mysize     = window.calcCordsToCenter(mysize.height, mysize.width);
		
		// Set the position of the bezel
		this.bezel.setStyle(
		{
			top:  mysize.top  + "px",
			left: mysize.left + "px"
		});
		
		this.bezel.show();
		
		if (typeof this.options.onShow == "function") 
		{
			this.options.onShow();
		}
		
		if (this.options.displayTime > 0) 
		{
			new PeriodicalExecuter(function(executer)
			{
				this.hide();
				executer.stop();
			}.bind(this), this.options.displayTime);
		}
		
		return this;
	},
	
	/*
	 * Removes the bezel from the DOM.
	 */
	destroy: function() 
	{
		try 
		{
			document.body.removeChild(this.bezel);
		} 
		catch (e) 
		{
			// Ignore errors
		}
	},
	
	/*
	 * Fades out the notification bezel. If this is not a sticky bezel 
	 * (displayTime > 0) then this function will be called automatically 
	 * by the show routine.
	 */
	hide: function() 
	{
		new Effect.Fade(this.bezel, 
		{ 	
			duration:    this.options.fadeTime, 
			
			afterFinish: function() 
			{
				this.visible = false;
			
				if (this.options.destroy) 
				{
					this.destroy();
				}

				this.options.afterHide(this);
			}.bind(this)
		});
	}
});