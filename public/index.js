"use strict";


function updateMessagePreview(message) {
  
     $( "#messagePreview" ).val( message );
 
}


$( function () {
    $( "#message" ).on( "input", function () {
            updateMessagePreview($( this ).val());
    } );


    $( "#friendListSearch" ).on( "input", function () {

        if($( this ).val().length === 0){
            $( "#friendList li" ).filter( function () {
                $( this ).css({"display" : "block"})
            })
        }else{
            var search =  $.trim( $( this ).val() ).toLowerCase();

            console.log(search);
            
            $( "#friendList li" ).filter( function () {
   
               var ret =  $( this ).text().toLowerCase().indexOf( search ) < 0;
   
               if ( !ret )
               {
                   $( this ).css({"display" : "block"})
               }else{
                   $( this ).css({"display" : "none"})
               }
               
           })
        }

    })

        
} );