/*
 * Material Experience - Card Layout Engines Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

// Card.Layout.Errors = Class.create();
// Object.extend(Object.extend(Card.Layout.Errors.prototype, Card.Layout.prototype), 

Card.Layout = Class.create();
Object.extend(Card.Layout.prototype, 
{
	/*
	 * Initialize the layout class
	 */
	initialize: function(cframe, data, card) 
	{
		this.cframe       = cframe;
		this.data         = data;
		this.card         = card;
		this.color        = this.card.options.color;
		this.hasResources = false;
	},
		
	/*
	 * Main function to layout the card.
	 */
	layout: function() 
	{
		throw "Not implemented here.";
	},
	
	/*
	 * Throw the card into a popup window for printing.
	 */
	print: function() 
	{
		throw "Not implemented here.";
	},
	
	/*
	 * Debug the card layout. Generally this should be used to spot out
	 * data issues. But it could also be used for other debugging purposes.
	 */
	_debug: function() 
	{
		throw "Not implemented here.";
	}
});