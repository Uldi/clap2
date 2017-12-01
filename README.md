# clap
Cloud TAP SVG Diagramm Generation Tooling

## configuration files
* **config.json** --> contains the width, hight, spaces etc. of the different elments
* **clap.json** --> definition of the RTE, DPE, Common Services, IOs etc.
* **.env** --> template file definition

## folders
* **templates** --> contains als svg snippet templates and configurtation files
* **svg** --> output directory for the generated files, contains also the legend svgs

#clap.json - Dokumentation
```
"clap": {
        //clusters the deployment environments
        "dpeCloud": [
            {
                "name": "Client",   //mandatory
                "opacity": 0.8,     //sichtbarkeit - je tiefer, desto mehr ist die dpe in der cloud
                "dpe": [    // 1 - n dpe pro dpe cloud
                    {
                        "name": "Client Device",
                        "details": "",  //detail text, optional
                        "url": "http://client.com",  //url link - optional
                        "rte": [ // 1 - n rte pro dpe
                            {
                                "name": "SPA, Native/Hybrid App",
                                "url": "http://spa.com",  //url link - optional
                                "state": "green",   //status --> bestimmt die Einfärbung:  green, yellow, blue, red
                                "detail": { // Zusatzangaben pro Detailsicht. Link über id attribut
                                    "io": [ // Spezielle detail Sicht, wird mit provider und consumer icons gerendert
                                        {
                                            "row": "r", //link auf Service Bus
                                            "consumer": "green",    //optional, green, red, blue, grey
                                            "url": "http://google.ch" //url link - optional
                                        },
                                        ....
                                    "db": [ //detailview, link über Name des Attributes (hier db) auf die Detailsichtdefinition
                                    {
                                        "row": "oracle", //link auf Detailsichtzeile (row)
                                        "state": "green",   //green, yellow, blue, red
                                        "url": "http://oracle.com" // url link - optional
                                    },

...
        //Definition der Infra Common Services
        "infraCS": [    //1-n Elemente, wird auf Clap Sicht dargestellt
            {
                "name": "Datastores, Databases, ...",   //name, wird so gerendert
                "url": "http://infra.cs"    //url link - optional
            },
            ...
        ],
        //Definition der App Common Services
        "appCS": [  //1-n Elemente, wird auf Clap Sicht dargestellt
            {
                "name": "Business Events",  //name, wird so gerendert
                "url": "http://app.cs"  //url link - optional
            },
            ...
        "detailViews": [ //0 -n Detailsichten, werden mit in Datei detailView_<name>.html/svg gerendert
            {
                "id": "io", //id der Detailsicht, wird bei den RTE referenziert
                "name": "Service Bus",  //name
                "gradient": {   //Farbgradient zur Darstellung - optional
                    "colorDark": "#0000bf",
                    "colorLight": "#aad4ff"
                },
                "row": [ 1 - n Zeilendefinitionen pro Detailsicht
                    {
                        "name": "CORBA",
                        "id": "c", //id der Zeile, wird bei der RTE referenziert
                        "url": "http://corba.com"   //url link - optional
                        "gradient": {   //Farbgradient zur Darstellung - optional
                            "colorDark": "#ff7f00",
                            "colorLight": "#ffffaa"
                        }
                    },
```