
// Adapted from three.js/examples/jsm/exporters/OBJExporter.js
import {
	BufferGeometry,
	Matrix3,
	Mesh,
	Object3D,
	Vector3
} from 'three';

class OBJExporter {
	parse( object: Object3D ) {
		let output = '';
		let indexVertex = 0;
		let indexVertexUv = 0;
		let indexNormals = 0;

		const vertex = new Vector3();
		const normal = new Vector3();
		const uv = { x: 0, y: 0 };

		const face = [];

		const parseMesh = ( mesh: Mesh ) => {
			if ( ! ( mesh.isMesh ) ) return;

			const nbVertex = 0;
			const nbNormals = 0;
			const nbVertexUv = 0;

			const geometry = mesh.geometry as BufferGeometry;

			const normalMatrixWorld = new Matrix3();

			if ( geometry.isBufferGeometry !== true ) {
				throw new Error( 'Unsupported geometry type' );
			}

			// shortcuts
			const vertices = geometry.getAttribute( 'position' );
			const normals = geometry.getAttribute( 'normal' );
			const uvs = geometry.getAttribute( 'uv' );
			const indices = geometry.getIndex();

			// name of the mesh object
			output += 'o ' + mesh.name + '\n';

			// name of the mesh material
			if ( mesh.material && Array.isArray(mesh.material) === false && mesh.material.name ) {
				output += 'usemtl ' + mesh.material.name + '\n';
			}

			// vertices
			if ( vertices !== undefined ) {
				for ( let i = 0, l = vertices.count; i < l; i ++, nbVertex ) {
					vertex.x = vertices.getX( i );
					vertex.y = vertices.getY( i );
					vertex.z = vertices.getZ( i );
					// transform the vertex to world space
					vertex.applyMatrix4( mesh.matrixWorld );
					// transform the vertex to export format
					output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
				}
			}

			// uvs
			if ( uvs !== undefined ) {
				for ( let i = 0, l = uvs.count; i < l; i ++, nbVertexUv ) {
					uv.x = uvs.getX( i );
					uv.y = uvs.getY( i );
					// transform the uv to export format
					output += 'vt ' + uv.x + ' ' + uv.y + '\n';
				}
			}

			// normals
			if ( normals !== undefined ) {
				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );
				for ( let i = 0, l = normals.count; i < l; i ++, nbNormals ) {
					normal.x = normals.getX( i );
					normal.y = normals.getY( i );
					normal.z = normals.getZ( i );
					// transform the normal to world space
					normal.applyMatrix3( normalMatrixWorld ).normalize();
					// transform the normal to export format
					output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
				}
			}

			// faces
			if ( indices !== null ) {
				for ( let i = 0, l = indices.count; i < l; i += 3 ) {
					for ( let m = 0; m < 3; m ++ ) {
						const j = indices.getX( i + m ) + 1;
						face[ m ] = ( indexVertex + j ) + ( uvs ? '/' + ( indexVertexUv + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' );
					}
					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + '\n';
				}
			} else {
				for ( let i = 0, l = vertices.count; i < l; i += 3 ) {
					for ( let m = 0; m < 3; m ++ ) {
						const j = i + m + 1;
						face[ m ] = ( indexVertex + j ) + ( uvs ? '/' + ( indexVertexUv + j ) : '' ) + ( normals ? '/' + ( indexNormals + j ) : '' );
					}
					// transform the face to export format
					output += 'f ' + face.join( ' ' ) + '\n';
				}
			}

			// update index
			indexVertex += nbVertex;
			indexVertexUv += nbVertexUv;
			indexNormals += nbNormals;
		};

		object.traverse( function ( child ) {
			if ( child instanceof Mesh ) {
				parseMesh( child );
			}
		} );

		return output;
	}
}

export { OBJExporter };
