/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _objects, _camera, _domElement ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();				// 2D surface that extends infinitely into space; default normal is x (1,0,0)
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();
	var _worldPosition = new THREE.Vector3();
	var _inverseMatrix = new THREE.Matrix4();	// Matrix to apply to Object Vector3 - affects transforms. 
												// Every Object has 3 Matrix4's: 
												// 		matrix - local Transform of Object relative to parent 
												// 		matrixWorld - world Transform of Object. If Object has no parent, then identical to local Transforom
												// 		modelViewMatrix - Object's Transform relative to the camera's coordinate system (Object3D.matrixWorld * Camera.matrixWorldInverse)
	var _selected = null, _hovered = null;
	
	var _parent = null;							// JB ADDED - to store root object of base pair
	var _fullPosition = new THREE.Vector3();	// JB ADDED - to store full position offset temporarily

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function dispose() {

		deactivate();

	}

	// DRAG - MOUSE  (MOVE OBJECT)
	function onDocumentMouseMove( event ) {

		event.preventDefault();

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;			// X Position Normalized
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;		// Y Position Normalized

		_raycaster.setFromCamera( _mouse, _camera );								// Set Raycaster Position and Direction

		if ( _selected && scope.enabled ) {											// Selected Object and Scope is go

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {			// If the ray intersects the plane

				// THIS MOVES THE OBJECT
				_fullPosition.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );				// JB Added
				// _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );		// OLD LINE - Object's position set to: intersection minus offset, with inverseMatrix applied
				
				_parent = _selected;
				while(_parent.name !== 'basePair_Loc') {														// Get the Root Object - 'basePair_Loc' (hard-coded)
					_parent = _parent.parent;
				}
				
				_parent.position.setY(_fullPosition.y);															// JB Added`- Constrain movement to Y axis							`

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

		// HOVER POINTER STYLE
		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;
			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;
			}
		}
	}

	// DRAG START - MOUSE  (SELECT OBJECT)
	function onDocumentMouseDown( event ) {

		event.preventDefault();										// Prevents default behaviour of this event

		_raycaster.setFromCamera( _mouse, _camera );				// Updates ray with new origin and direction (normalized space [-1 to 1])

		var intersects = _raycaster.intersectObjects( _objects );	// list of Objects that intersect the ray

		if ( intersects.length > 0 ) {								// If at least one Object

			_selected = intersects[ 0 ].object;						// Get the first Object that intersects the ray

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {		// Get intersection point if it exists; assign to '_intersection'

				_inverseMatrix.getInverse( _selected.parent.matrixWorld );		// Get the Object's Parent's matrixWorld and convert to Inverse
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );	// Copy intersection to '_offset', then subtract the vector made from the Object's matrixWorld
			}

			_domElement.style.cursor = 'move';						// Change cursor style to cross with arrows ("Move")

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	// DRAGEND - MOUSE
	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	// DRAG - TOUCH
	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

	}

	// MOVE OBJECT - TOUCH
	function onDocumentTouchStart( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_inverseMatrix.getInverse( _selected.parent.matrixWorld );
				_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	// DRAGEND _ TOUCH
	function onDocumentTouchEnd( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	// ADD LISTENERS
	activate();


	// API
	this.enabled = true;
	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
