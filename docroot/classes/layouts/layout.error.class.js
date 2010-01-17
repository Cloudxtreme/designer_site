/*
 * Material Experience - Error Card Layout Engine
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

Card.Layout.Errors = Class.create();
Object.extend(Object.extend(Card.Layout.Errors.prototype, Card.Layout.prototype), 
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
		this.cframe.innerHTML = '';
		this.cframe.appendChild(Builder.node('h1', Strings.cardErrorTitle));
		this.cframe.appendChild(Builder.node('p', Strings.cardErrorText));
	}
});