var map;

//Array para fazer as marcações no mapa
var markers = [];

// Array com meus locais preferidos
var myLocations = [
    {title: 'Chef Fits', location: {lat: -5.794787, lng: -35.200971}, visible: true},
    {title: 'Chapelatto Coffee Shop', location: {lat: -5.7930606700876375, lng: -35.200829584927}, visible: true},
    {title: 'Museu Câmara Cascudo', location: {lat:  -5.803308, lng: -35.201848}, visible: true},
    {title: 'Restaurante Tábua de Carne', location: {lat: -5.794004, lng: -35.184144}, visible: true},
    {title: 'Parque das Dunas', location: {lat: -5.810635, lng: -35.194986}, visible: true},
    ];


// Chaves para FourSquare
var CLIENT_ID = 'HMBMS5MZ5CG4HONJHGFKNL45BAOWFUICZ1X4IQUJFLKKRTA4';
var CLIENT_SECRET = '02DVPFKULFS33O5Y3M5JWAIGWQ0O4KPBF0JDTDCXJX4I2JTH';

// Função para iniciar o mapa
function initMap(){
    map = new google.maps.Map(document.getElementById('map'),{
        mapTypeControl: false
    });
                 
	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
   
	// Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
   
	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    var largeInfowindow = new google.maps.InfoWindow();       
	
	
	
	// Laço para ler o Array com meus locais e gerar os marcadores no mapa
    myLocations.forEach(function(location, i) {
		var position = location.location;
        var title = location.title;
        // Cria o marcador
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
			id: i
        });
				
    // Insere o marcador no array
    markers.push(marker);

    // Evento onclick para abrir o infowindow em cada marcador.
          marker.addListener('click', function() {
			this.setAnimation(google.maps.Animation.BOUNCE);
            populateInfoWindow(this, largeInfowindow);
          });
     // Eventos para alterar a cor do marcador ao passar o mouse sobre ele
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
    
	marker.setMap(map);
    bounds.extend(marker.position);
    });
	
	//aplica bindings do modelo
    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    map.fitBounds(bounds); 
	
}

function populateInfoWindow(marker, infowindow) {
        // Verifica se a infowindow ainda não está aberta neste marcador. Se sim então abre a infoWindow
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
            
        var url = "https://api.foursquare.com/v2/venues/search?ll="+ marker.position.lat() +","+ marker.position.lng() +
        "&client_id="+ CLIENT_ID + "&client_secret="+ CLIENT_SECRET +"&v=20190423&m=foursquare&limit=1&name=" + marker.title;
        
        $.getJSON(url, function(data){
        var result = data.response.venues[0];
        var name = result.name;
        var endereco = result.location.formattedAddress;
        var categoria = result.categories[0].name;
        var contentString = "<div><h3>FourSquare: Informações do Local</h3></div>" +
                            "<div><b>Nome do Local</b>: "+ name + "</div>" +
                            "<div><b>Endereço</b>: "+ endereco + "</div>" +
                            "<div><b>Categoria</b>: "+ categoria + "</div>"
        infowindow.setContent(contentString);
        }).fail(function(e){
            infowindow.setContent("Erro: Não foi possível carregar informações do FourSquare.");
        });
            
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
	    marker.setAnimation(google.maps.Animation.null);
            infowindow.marker = null;
            infowindow.setContent("");
          });
        }
      }

// Função para alterar cor do marcador 
function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

function googleMapLoadError() {
  alert("Falha ao carregar o mapa");  
}
	  
// Uso do Knockout.js para filtro e exibição da lista de locais

var Location = function(data, i) {
	var self = this;
    self.title = ko.observable(data.title);
    self.location = ko.observable(data.location);
	self.id = ko.observable(data.i);
	self.marker = markers[i];
}

var ViewModel = function() {
    var self = this;
	self.locationList = ko.observableArray([]);
    self.searchTerm = ko.observable("");
	
	myLocations.forEach(function(local, i){
		self.locationList.push(new Location(local, i));
	});

	// Filtro para a lista de locais
	self.filteredList = ko.computed(function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(local) {
				local.marker.setVisible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(this.locationList(), function(local) {
				var string = local.title().toLowerCase();
				var result = (string.search(filter) > -1);
				local.marker.setVisible(result);
				return result;
			});
		}
	}, self);
	
	self.itemListaClicado = function(location) {
		var infoWindowMarker = new google.maps.InfoWindow();
		populateInfoWindow(location.marker, infoWindowMarker);
		location.marker.setAnimation(google.maps.Animation.BOUNCE);
	}
};
