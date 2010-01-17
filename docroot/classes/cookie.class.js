/*
 * Material Experience - Cookie Handling Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com) on 10/2/07
 * Updated by Mike Crute (mcrute@eyemg.com) on 10/3/07
 * 
 * Class to handle cookie CRUD. Code adapted from:
 * http://www.quirksmode.org/js/cookies.html
 */

var Cookie = Object.extend(Class.create(), 
{
	/*
	 * Creates a cookie.
	 */
	create: function(name, value, days) 
	{
		if (days) 
		{
			var date    = new Date().setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			var expires = "; expires=" + date.toGMTString();
		}
		
		document.cookie = name + "=" + value + (expires ? expires : '') + "; path=/";
	},
	
	/*
	 * Setting the expiration date of the cookie to -1 effectively deletes
	 * it.
	 */
	erase: function(name) 
	{
		createCookie(name,"",-1);
	},
	
	/*
	 * Reads a cookie and returns the value.
	 */
	read: function(name) 
	{
		var nameEQ = name + "=";
		var ca     = document.cookie.split(';');
		
		for ( var i = 0; i < ca.length; i++ ) 
		{
			var c = ca[i];
			
			while (c.charAt(0) == ' ')
			{
				c = c.substring(1,c.length);
			}
			
			if (c.indexOf(nameEQ) == 0)
			{
				return c.substring(nameEQ.length,c.length);
			}
		}
		
		return null;
	}
});

/*
 * Shorthand for Cookie.read
 */
function $C(name) 
{ 
	return Cookie.read(name); 
}