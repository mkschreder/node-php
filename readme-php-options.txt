NAME
php - PHP Command Line Interface 'CLI'

php-cgi - PHP Common Gateway Interface 'CGI' command

SYNOPSIS
php [options] [ -f ] file [[--] args...]

php [options] -r code [[--] args...]

php [options] [-B code] -R code [-E code] [[--] args...]

php [options] [-B code] -F file [-E code] [[--] args...]

php [options] -- [ args...]

php [options] -a

php [options] -S addr:port [-t docroot]

DESCRIPTION
PHP is a widely-used general-purpose scripting language that is especially suited for 
Web development and can be embedded into HTML. This is the command line interface that 
enables you to do the following:

You can parse and execute files by using parameter -f followed by the name of the 
file to be executed.

Using parameter -r you can directly execute PHP code simply as you would do inside 
a .php file when using the eval() function.

It is also possible to process the standard input line by line using either the parameter 
-R or -F. In this mode each separate input line causes the code specified by -R or the 
file specified by -F to be executed. You can access the input line by $argn. While 
processing the input lines $argi contains the number of the actual line being processed. 
Further more the parameters -B and -E can be used to execute code (see -r) before and 
after all input lines have been processed respectively. Notice that the input is read 
from STDIN and therefore reading from STDIN explicitly changes the next input line or 
skips input lines.

PHP also contains an embedded web server for application development purpose. By using 
the -S option where addr:port point to a local address and port PHP will listen to HTTP 
requests on that address and port and serve files from the current working directory or 
the docroot passed by the -t option.

If none of -r -f -B -R -F -E or -S is present but a single parameter is given then this 
parameter is taken as the filename to parse and execute (same as with -f). If no parameter 
is present then the standard input is read and executed.

OPTIONS

    --interactive 
    -a Run PHP interactively. This lets you enter snippets of PHP code that directly get 
        executed. When readline support is enabled you can edit the lines and also have history support. 
    --bindpath address:port|port 
    -b address:port|port Bind Path for external FASTCGI Server mode (CGI only). 
    --no-chdir 
    -C Do not chdir to the script's directory (CGI only). 
    --no-header 
    -q Quiet-mode. Suppress HTTP header output (CGI only). 
    --timing count 
    -T count Measure execution time of script repeated count times (CGI only). 
    --php-ini path|file 
    -c path|file Look for php.ini file in the directory path or use the specified file 
    --no-php-ini 
    -n No php.ini file will be used 
    --define foo[=bar] 
    -d foo[=bar] Define INI entry foo with value bar 
    -e
    Generate extended information for debugger/profiler 
    --file file 
    -f file Parse and execute file 
    --global name 
    -g name Make variable name global in script. 
    --help 
    -h This help 
    --hide-args 
    -H Hide script name (file) and parameters (args...) from external tools. For example 
    you may want to use this when a php script is started as a daemon and the command line 
    contains sensitive data such as passwords. 
    --info 
    -i PHP information and configuration 
    --syntax-check 
    -l Syntax check only (lint) 
    --modules 
    -m Show compiled in modules 
    --run code 
    -r code Run PHP code without using script tags '<?..?>' 
    --process-begin code 
    -B code Run PHP code before processing input lines 
    --process-code code 
    -R code Run PHP code for every input line 
    --process-file file 
    -F file Parse and execute file for every input line 
    --process-end code 
    -E code Run PHP code after processing all input lines 
    --syntax-highlight 
    -s Output HTML syntax highlighted source 
    --server addr:port 
    -S addr:port Start embedded Webserver on the given local address and port 
    --docroot docroot 
    -t docroot Specify the document root to be used by the embedded web server 
    --version 
    -v Version number 
    --stripped 
    -w Output source with stripped comments and whitespace 
    --zend-extension file 
    -z file Load Zend extension file 

args...
    Arguments passed to script. Use '--' args when first argument starts with '-' or script is 
    read from stdin 
    --rfunction name 
    --rf name Shows information about function name 
    --rclass name 
    --rc name Shows information about class name 
    --rextension name 
    --re name Shows information about extension name 
    --rzendextension name 
    --rz name Shows information about Zend extension name 
    --rextinfo name 
    --ri name Shows configuration for extension name 
--ini
    Show configuration file names 
