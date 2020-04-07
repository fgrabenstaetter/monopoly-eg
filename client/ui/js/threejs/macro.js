var pawn = [
        "moto", "citroen C4", 
        "boat", "montgolfiere", 
        "overboard", "tracteur", 
        "schoolbus", "camion"
];


let tabCases = {
        0 : new THREE.Vector3(0.335*11.5, 2, 0.335*11.5), 
  
        1  : new THREE.Vector3(0.335*10, 2, 0.335*11.5),
        2  : new THREE.Vector3(0.335*9, 2, 0.335*11.5), 
        3  : new THREE.Vector3(0.335*8, 2, 0.335*11.5), 
        4  : new THREE.Vector3(0.335*7, 2, 0.335*11.5), 
        5  : new THREE.Vector3(0.335*6, 2, 0.335*11.5),
        6  : new THREE.Vector3(0.335*5, 2, 0.335*11.5), 
        7  : new THREE.Vector3(0.335*4, 2, 0.335*11.5), 
        8  : new THREE.Vector3(0.335*3, 2, 0.335*11.5), 
        9  : new THREE.Vector3(0.335*2, 2, 0.335*11.5), 
        
        10  : new THREE.Vector3(0.335*1,2,0.335*11.5),
        
        11  : new THREE.Vector3(0.335*1,2,0.335*10), 
        12  : new THREE.Vector3(0.335*1,2,0.335*9),
        13  : new THREE.Vector3(0.335*1,2,0.335*8), 
        14  : new THREE.Vector3(0.335*1,2,0.335*7), 
        15  : new THREE.Vector3(0.335*1,2,0.335*6), 
        16  : new THREE.Vector3(0.335*1,2,0.335*5), 
        17  : new THREE.Vector3(0.335*1,2,0.335*4), 
        18  : new THREE.Vector3(0.335*1,2,0.335*3),
        19  : new THREE.Vector3(0.335*1,2,0.335*2), 
        
        20  : new THREE.Vector3(0.335*1,2,0.335*1), 
        
        21  : new THREE.Vector3(0.335*2,2,0.335*1), 
        22  : new THREE.Vector3(0.335*3,2,0.335*1), 
        23  : new THREE.Vector3(0.335*4,2,0.335*1), 
        24  : new THREE.Vector3(0.335*5,2,0.335*1), 
        25  : new THREE.Vector3(0.335*6,2,0.335*1), 
        26  : new THREE.Vector3(0.335*7,2,0.335*1), 
        27  : new THREE.Vector3(0.335*8,2,0.335*1), 
        28  : new THREE.Vector3(0.335*9,2,0.335*1), 
        29  : new THREE.Vector3(0.335*10,2,0.335*1), 
        
        30  : new THREE.Vector3(0.335*11.5,2,0.335*1), 
        31  : new THREE.Vector3(0.335*11.5,2,0.335*2), 
        32  : new THREE.Vector3(0.335*11.5,2,0.335*3), 
        33  : new THREE.Vector3(0.335*11.5,2,0.335*4), 
        34  : new THREE.Vector3(0.335*11.5,2,0.335*5), 
        35  : new THREE.Vector3(0.335*11.5,2,0.335*6), 
        36  : new THREE.Vector3(0.335*11.5,2,0.335*7), 
        37  : new THREE.Vector3(0.335*11.5,2,0.335*8), 
        38  : new THREE.Vector3(0.335*11.5,2,0.335*9), 
        39  : new THREE.Vector3(0.335*11.5,2,0.335*10) 
}


var tabHouse = {
	1 : "M1_1",
	3 : "M1_2",
	6 : "M2_1",
	8 : "M2_2",
	9 : "M2_3",
	11 : "M3_1",
	13 : "M3_2",
	14 : "M3_3",
	16 : "M4_1",
	18 : "M4_2",
	19 : "M4_3",
	21 : "M5_1",
	23 : "M5_2",
	24 : "M5_3",
	26 : "M6_1",
	27 : "M6_2",
	29 : "M6_3",
	31 : "M7_1",
	32 : "M7_2",
	34 : "M7_3",
	37 : "M8_1",
	39 : "M8_2"
}


var tabHotel = {
	1 : "H1_1",
	3 : "H1_2",
	6 : "H2_1",
	8 : "H2_2",
	9 : "H2_3",
	11 : "H3_1",
	13 : "H3_2",
	14 : "H3_3",
	16 : "H4_1",
	18 : "H4_2",
	19 : "H4_3",
	21 : "H5_1",
	23 : "H5_2",
	24 : "H5_3",
	26 : "H6_1",
	27 : "H6_2",
	29 : "H6_3",
	31 : "H7_1",
	32 : "H7_2",
	34 : "H7_3",
	37 : "H8_1",
	39 : "H8_2"
}

var drapPlane = { 
        'd1' : 'Plane1_0',
        'd3' : 'Plane3_0',
        'd5' : 'Plane5_0',
        'd6' : 'Plane6_0',
        'd8' : 'Plane8_0',
        'd9' : 'Plane9_0',
        'd11' : 'Plane11_0',
        'd12' : 'Plane12_0',
        'd13' : 'Plane13_0',
        'd14' : 'Plane14_0',
        'd15' : 'Plane15_0',
        'd16' : 'Plane16_0',
        'd18' : 'Plane18_0',
        'd19' : 'Plane19_0',
        'd21' : 'Plane21_0',
        'd23' : 'Plane23_0',
        'd24' : 'Plane24_0',
        'd25' : 'Plane25_0',
        'd26' : 'Plane26_0',
        'd27' : 'Plane27_0',
        'd28' : 'Plane28_0',
        'd29' : 'Plane29_0',
        'd31' : 'Plane31_0',
        'd32' : 'Plane32_0',
        'd34' : 'Plane34_0',
        'd35' : 'Plane35_0',
        'd37' : 'Plane37_0',
        'd39' : 'Plane39_0'
}