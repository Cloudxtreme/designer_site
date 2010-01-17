/*
 * Material Experience - Special Case Layout Engine
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

Card.Layout.Special = Class.create();
Object.extend(Object.extend(Card.Layout.Special.prototype, Card.Layout.prototype), 
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
		
		// Check if the url is provided otherwise pull it out of the
		// wide content field.
		if (!this.data.url) 
		{
			this.data.url = this.data.contentWide[0].url;
		}
	},
		
	/*
	 * Main function to layout the card.
	 */
	layout: function() 
	{
		this.cframe.innerHTML = '<iframe ' +
					'src         = "' + this.data.url + '" ' + 
					'frameborder = "0" ' + 
					'width       = "' + (SME.sizes.card.width - 11) + '" ' +
					'height      = "' + (SME.sizes.card.height - 40) + '"' +
					'></iframe>';
	}
});