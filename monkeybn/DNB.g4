
grammar DNB;

plot:		command+ EOF;

command: 	sizeCmd | paperCmd | penCmd | lineCmd | repeatCmd;

paperCmd:	'Paper' color;

sizeCmd:	'Size' coord coord;

penCmd: 	'Pen' color;

lineCmd: 	'Line' coord coord coord coord;

repeatCmd: 	'Repeat' NAME fromIndex toIndex '{' command+ '}';

color:		NUMBER | NAME;

coord:		NUMBER | NAME;

fromIndex:	NUMBER;

toIndex:	NUMBER;

NUMBER: 	('0'..'9')+;
NAME:		( 'a' .. 'z' | 'A' .. 'Z' | '0' .. '9' | '.' | '_' | '/' )+;
WS:   		[ \t\n\r]+ -> skip ;



