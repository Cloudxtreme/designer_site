/*
 * Material Experience - Card Chip Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * An HTML based approach to drawing rounded corners using element
 * "slices" to create the corners instead of images. This depends 
 * on a section in the stylesheet to work correctly.
 * 
 * Code adapted from: http://www.html.it/articoli/nifty/index.html
 */

var RoundedCorners = Class.create();
Object.extend(RoundedCorners.prototype, 
{
	// Direction table for rounded corners.
	directions: 
	{
		top :    'top', 
		bottom : 'bottom' 
	},
	
	/* 
	 * Initialize the object
	 */
	initialize: function(color) 
	{
		this.color = color;
	},
	
	/*
	 * Creates a rounded corner container.
	 */
	get: function(direction) 
	{
		var slicebox = document.createElement('b');
		slicebox.className = 'round';
		
		if (direction == this.directions.top) 
		{
			var myEnum = $A($R(1,10));
		} 
		else 
		{
			var myEnum = $A($R(1,10)).reverse();
		}
		
		myEnum.each(function(item) 
		{
			var corner                   = document.createElement('b');
			corner.className             = 'rcSlice_' + item;
			corner.style.backgroundColor = this.color;
			slicebox.appendChild(corner);
		}.bind(this));
		
		return slicebox;
	}
});