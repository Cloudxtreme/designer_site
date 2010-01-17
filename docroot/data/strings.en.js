/*
 * Material Experience - English Strings File
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * This strings file is the foundation for internationalization of the 
 * Material Experience website. These strings can be changed to anything
 * and those changes will be reflected in the interface. Be careful, you
 * can also potentially seriously break things. Follow the rules and 
 * comments.
 * 
 * Note that as of this writing full internationalization is not fully 
 * implemented and won't be till the client requests it, I anticipate
 * this happening some day so here we are with a strings file.
 * 
 * Rules:
 * Quoting -- if you need to use quotes, either single or double make sure
 *            you vary your quoting, 'this won't' work you need "this'll work"
 *            
 * HTML    -- some strings can contain HTML, don't go crazy, constrain your 
 *            HTML to line breaks or you will breaks and maybe images or
 *            you will break things.
 *            
 * Doubt   -- if your not sure what effect your changes will have ASK SOMEBODY
 *            don't just make changes and hope things work
 *            
 * Unicode -- sure, you can use unicode, just make sure you save the file with
 *            the appropriate character set. No BOM please.
 *            
 * Comment -- leave the comments alone, and change the updated by comment at the
 *            top of this file when you make changes.
 */

var Strings = 
{
	//
	// LANGUAGE FILE METADATA
	//
	// Language of the String File and version of the site this is for
	// Neither of these are used yet but set them anyhow since they
	// may be used later on. Use C-style locale codes for the language.
	//
	// Stars are perfectly acceptable in the version field but will only
	// be matched to 3 places.
	language        : 'en_us',
	version         : '1.*',
	
	//
	// APPLICATION TITLE
	//
	// Displayed in the browser title bar
	appTitle: 'Material Experience',
		
	//
	// WINDOW SIZE ERROR
	//
	// Displayed once when the window size is smaller than the minimum size
	windowSize      : "Your window size is smaller than the recommended 1024x768 resolution.<br/>" +
					  "Some items may be positioned outside the viewable area.",

	//
	// DATA LOADERS
	//
	// Displayed whenever an AJAX call is made and while it is waiting to load
	loadingNoAnim   : "Loading Data...",
	loadingAnim     : "Loading Data <img src='images/loader.gif'/>",

	//
	// PRINTING ERRORS
	//
	cantPrint       : "Sorry Can't Print",                  // Displayed if the browser doesn't support printing
	printClose      : "Do you want to close this window?",  // Displayed before we auto/close the print window
	
	//
	// CARD DATA ERRORS
	//
	// Displayed within a card when it fails to load correctly
	cardErrorTitle  : "Card Error",
	cardErrorText   : "We're very sorry, there was an error loading this card. Please try again later.",
	
	//
	// AJAX ERRORS
	//
	// Displayed when an AJAX call fails.
	ajaxError       : "Some Data Could Not Be Loaded.<br/> We're sorry, please refresh this page.",
	
	//
	// CARD BUTTON LABELS
	//
	// Labels shown next to the buttons in the card
	addToSketchbook : "Add to Sketchbook",
	sendToFriend    : "Send to a Friend",
	printCard       : "Print this Card",
	myHistory       : "My History",
	closeCard       : "Close Card",
	
	//
	// CARD CONTENT
	//
	// Static content within the card that is hard-coded
	moreInfo        : "More Information",
	skipButton      : "Skip this Card",
	
	//
	// SKETCHBOOK ERRORS AND CONFIRMATIONS
	//
	// Confirmations and errors for sketchbook actions
	sketchbook      : "Sketchbook",
	alreadyAddedSB  : "Card already exists in your sketchbook.",
	addedSketchbook : "Added to Sketchbook",
	addedGuestSB    : "Added to Guest Sketchbook<br/>Please visit the sketchbook to log in and save your items.",
 
	//
	// UTILITY BOX LINKS
	//
	// Links at the top right of the interface.
	pleaseLogin     : "Please Log In",
	manageAccount   : "Manage My Account",
	logout          : "Log Out"
};