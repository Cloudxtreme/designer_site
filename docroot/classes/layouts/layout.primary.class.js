/*
 * Material Experience - Primary Card Layout Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * WARNING: Here be dragons, OK so not as many as before but good luck you poor
 * sap.
 */
 
Card.Layout.Primary = Class.create();
Object.extend(Object.extend(Card.Layout.Primary.prototype, Card.Layout.prototype), 
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
		
		var direction          = data.template.replace(/narrow-/,'');
		this.direction         = direction ? direction : 'left';
		this.oppositeDirection = (direction == 'left') ? 'right' : 'left';
	},
	
	/*
	 * Set the column content. This can be flash, an image or an iframe.
	 */
	setColumn: function(url, direction, contTitle) 
	{
		var content = Builder.node('div', { style: 'float: ' + this.oppositeDirection }); 
		var myCol   = direction + 'Col';
		
		if (/swf$/.test(url)) // Flash
		{
			content.innerHTML = new SWFObject(url, 'cardFlash', 580, 479, 9, '#FFFFFF').getSWFHTML();
		} 
		else if (/(png|gif|jpg|jpeg)$/.test(url))  // Image
		{
			content = Builder.node('img', 
			{
				src:   url, 
				alt:   contTitle, 
				title: contTitle, 
				style: 'float: ' + this.oppositeDirection 
			});
		}
		else // iFrame
		{
			// Can't use DOM methods because IE is allergic
			content.innerHTML = '<iframe '                          + 
						'src         = "' + url + '" '  + 
						'frameborder = "0" '            +
						'scrolling   = "auto" '         +
						'width       = "580" '          +
						'height      = "480" '          +
						'id          = "wide_content" ' +
						'name        = "wide_content" ' +
					'></iframe>';
		}
		
		// We need to replace the content of the column if it exists to
		// facilitate changing content later on (i.e. thumbnails)
		if (typeof this[myCol] != 'undefined') 
		{
			this.cframe.replaceChild(content, this[myCol]);
			this[myCol] = content;
		} 
		else 
		{
			this[myCol] = this.cframe.appendChild(content);
		}

	},
	
	/*
	 * Build the resource (more information) list.
	 */
	getResourceList: function() 
	{
		// Only run if we need to
		if (!this.data.resources)
		{
			return;
		}
	
		var numResources  = 0;
		var iter          = 0;
		var limit         = 5;
		this.hasResources = true;
		
		this.resourceContainer = this.contentArea.appendChild(
			Builder.node('div', 
			[
				Builder.node('h2', { style: 'color: ' + this.card.options.color }, Strings.moreInfo),
				this.resources = Builder.node('ul', { className: 'resourceList' })
			]
		));
		
		this.data.resources.each(function(item) 
		{
			// Limit the number of allowable resources
			if (typeof item == 'undefined' || ++iter > limit)
			{
				return;
			}
			
			numResources++;
			
			this.resources.appendChild(Builder.node('li', 
				Builder.node('a', 
				{ 
					href:   item.link + '?entrypoint=DESIGNER', 
					target: '_new', 
					style:  'color: ' + this.color 
				}, item.title)
			));
		}.bind(this));
	},
	
	/*
	 * Set the contents of the narrow column.
	 */
	setHTML: function(content) 
	{
		this.htmlDiv.innerHTML = content;
	},
	
	/*
	 * Setup the thumbnails.
	 */
	getThumbnails: function() 
	{
		// Only run if we need to
		if (this.data.media.size() <= 1)
		{
			return;
		}
		
		var iter  = 0;
		var limit = 5; // Includes main media file
		var lData = this.data.media;
		
		this.thumbStrip = this.contentArea.appendChild(Builder.node('div', { className: 'thumbStrip' }));

		// Add the main media file to the data array
		lData.push(
		{
			thumb: this.data.contentWide[0].thumb,
			url:   this.data.contentWide[0].url
		});
		
		this.data.media.each(function(item) 
		{
			// Limit the number of thumbnails
			if (typeof item == 'undefined' || ++iter > limit) 
			{
				return;
			}
				
			var mediaPiece = this.thumbStrip.appendChild(
				Builder.node('img', 
				{
					src:        item.thumb, 
					className: 'mediaThumb' 
				})
			);
		
			Event.observe(mediaPiece, 'click', function() 
			{
				this.setColumn(item.url, this.direction, '');
			}.bindAsEventListener(this));
		}.bind(this));
	},
	
	/*
	 * Clean up the data.
	 */
	_cleanData: function() 
	{
		var lData = this.data.contentNarrow[0].htmlContent;
		this.data.contentNarrow[0].htmlContent = lData.replace(/<a/gi, '<a style="color: '+this.color+'"');
	},
	
	/*
	 * Calculate the heights of various interface elements for use in
	 * laying out the page.
	 */
	_calculateHeights: function()
	{
		// This data structure will hold the heights of all the elements 
		// in the narrow column for use in dynamically calculating the 
		// layout of the column.
		this.heightTable = 
		{
			headline      : this.headLine          ? this.headLine.getHeight()          : 0,
			content       : this.htmlDiv           ? this.htmlDiv.getHeight()           : 0,
			thumbnails    : this.thumbStrip        ? this.thumbStrip.getHeight()        : 0,
			resources     : this.resourceContainer ? this.resourceContainer.getHeight() : 0,
			paddingFactor : !Prototype.Browser.IE  ? 40                                 : 0
		};
		
		// If there is no headline IE comes up with a ridiculous height for some
		// reason so we correct for that here.
		if (Prototype.Browser.IE && this.data.contentNarrow[0].title.length == 0)
		{
			this.heightTable.headline = 0;
		}

		// A variety of exceptions/tweaks for IE6 found by testing every combination
		// of layouts and finding the variance. There isn't much of another way to
		// do it.
		if (Prototype.Browser.IE) 
		{
			this.heightTable.thumbnail += 2;
			this.heightTable.content   += 24;
		}
		
		if (Prototype.Browser.IE && this.resourceContainer) 
		{
			this.heightTable.resources -= 30;
		}
		
		if (Prototype.Browser.IE && this.htmlDiv && this.thumbStrip && !this.resourceContainer)
		{
			this.heightTable.thumbnails += 10;
		}
		
		
		if (Prototype.Browser.IE && this.resourceContainer && !this.thumbStrip)
		{
			this.heightTable.resources += 70;
		}

		// Calculate the height available for content
		this.heightTable.avaliableForContent = SME.sizes.innerCard.height - (
							this.heightTable.headline   + 
							this.heightTable.thumbnails + 
							this.heightTable.resources  + 
							this.heightTable.paddingFactor
						);
	},
	
	/*
	 * Setup the scroll bar on the wide content area.
	 */
	_setupScroller: function() 
	{
		// We only want to show the scroll bar if there is a need for it
		if (this.heightTable.content < this.heightTable.avaliableForContent) 
		{
			return;
		}
		
		this.contentArea.appendChild(
			this.scrollCont = Builder.node('div', 
			{ 
				style: 'border-left: 1px solid ' + this.card.options.color + ';' +
					'width: 1px; right: 0px; position: absolute; ' +
					'height:' + this.heightTable.avaliableForContent + 'px; ' +
					'top: ' + (this.heightTable.headline + 10) + 'px;' 
			},
			
			this.scrollBar  = Builder.node('img', 
			{ 
				src: 'images/pill.gif', 
				style: 'display: block; margin-left: -3px; cursor: move; ' +
					'background: ' + this.card.options.color + ';' 
			})
		));
		
		new Control.Slider(this.scrollBar, this.scrollCont, 
		{
			axis: 'vertical',
			range: $R(0, this.heightTable.content),
			
			onSlide: function(value) 
			{
				this.htmlDiv.scrollTop = value;
			}.bind(this)
		});
	
	},
	
	/*
	 * Main function to layout the card.
	 */
	layout: function() 
	{
		this._cleanData();
		
		this.setColumn(this.data.contentWide[0].url, this.direction, this.data.contentWide[0].title);
		
		this.contentArea = this.cframe.appendChild(
			Builder.node('div', { className: 'narrowCol' },
				this.headLine = Builder.node('h1', { style: 'color: ' + this.color }, this.data.contentNarrow[0].title)
			)
		);
		
		// We've gotta set the width here otherwise the height 
		// calculations will be incorrect
		this.htmlDiv = Builder.node('div', { style: 'width: 98%; overflow: hidden; width: 300px;' });
		
		// Must set this early on otherwise there is no way to determine 
		// the actual height of the content div
		this.setHTML(this.data.contentNarrow[0].htmlContent);
		this.contentArea.appendChild(this.htmlDiv);

		this.getResourceList();
		this.getThumbnails();

		// IE doesn't let prototype mess with the default object 
		// prototypes so we have to manually extend them. Sigh...
		[
			this.headLine, 
			this.htmlDiv, 
			this.thumbStrip, 
			this.resourceContainer, 
			this.contentArea
		].each(Element.extend);
	
		// Set these styles up here or we get a -21px bug in our 
		// calculation code
		this.contentArea.setStyle(
		{ 
			width:    '310px',
			position: 'absolute',
			top:      '0px'
		});
	
		this._calculateHeights();
		this._setupScroller();
		
		// We set this last, after all the height calculations are 
		// completed.  That makes it a lot easier to work with.
		this.htmlDiv.setStyle({ height: this.heightTable.avaliableForContent + 'px' });

		// Webkit doesn't pad things correctly
		if (this.direction == 'left') 
		{
			this.contentArea.setStyle({ left: '10px' });
		}
		else 
		{
			this.contentArea.setStyle({ right: '10px' });
		}
		
		// If this is an intro card do the intro card stuff.
		if (this.data.template == 'intro')
		{
			this._doIntro();
		}
		
		return this;
	},
	
	/*
	 * Setup an intro card. Because intro cards aren't really that much 
	 * different from a basic card and because class inheritance sucks in
	 * Prototype > 1.6 I'm just going to add this into here. 
	 */
	_doIntro: function() 
	{
		this.contentArea.appendChild(Builder.node('div', { className: 'skipbox' },
			this.skipLink = Builder.node('a', { href: '#tablehome', className: 'skiplink' }, 
			[
				Strings.skipButton,
				Builder.node('img', { src: 'images/arrow_right_grey.gif', className: 'skipimg' })
			])
		));
	},
	
	/*
	 * Throw the card into a popup window for printing.
	 */
	print: function() 
	{
		var wind = window.open('', '', 'width=' + SME.sizes.innerCard.width + ',height=' + (SME.sizes.innerCard.height + 60));

		with (wind) 
		{
			with (document) 
			{
				write('<html><head><style type="text/css">@import url(application.css); .narrowCol{top: 30px !important;}</style></head><body>');
				write('<img src="images/logo.jpg" style="display: block; margin: 5px 0px 30px 5px;"/>');
				write(this.cframe.innerHTML);
				write('</body></html>');
				close();
			}
			
			print();
			close();
		}
		
		return true;
	},
	
	/*
	 * Debug the card layout. Generally this should be used to spot out
	 * data issues. But it could also be used for other debugging purposes.
	 */
	_debug: function() 
	{
	
	}
});