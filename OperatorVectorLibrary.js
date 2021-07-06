/* 

Javascript Operator Overloading


Operator Vector Library

A vector math library using overloaded operators: Vector.a = Vector.b * Vector.c 

This code is for research purposes only.
It is a proof-of-concept for operator overloading in JavaScript using proxies.

Unfortunately, this method has no practical applications.


----------------------------------------------------------------------------

MIT License

Copyright (c) 2021 0X-JonMichaelGalindo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

const OperatorVectorLibrary = ( libraryName = 'V' ) => {

    const areNumbers = ( ...a ) => a.reduce( ( t, m ) => ( t && ( typeof m ==='number' ) ), true );

    const r = () => ( ''+Math.random() ).substring( 2 );
    const key = () => BigInt( r() + r() );

    const typeError = ( op, a, b ) => { throw `${libraryName}: Type Error: ${kindNames[a]} ${op} ${kindNames[b]} is not a valid operation` };

    const ops = {
        //a and b are { id, construct, kind, source }
        //select via a.kind, b.kind; apply to a.source, b.source; return { result, kind }
        '*': ( a, b ) => ( { // { result, kind }
            [ true ]: ( a, b ) => typeError( '*', a.kind, b.kind ),
            [ b.kind === Num ] : ( a, b ) => ops[ '*' ]( b, a ),
            [ a.kind === Vec4 && b.kind === Mat4 ] : ( a, b ) => ops[ '*' ]( b, a ),
            [ a.kind === Vec3 && b.kind === Mat3 ] : ( a, b ) => ops[ '*' ]( b, a ),
            [ a.kind === Num ] : ( a, b ) => ( { result: [ ...b ].map( n => n*a.x ), kind: b.kind } ),
            [ a.kind === Vec3 && b.kind === Vec3 ] : ( { kind: Vec3,
                result: {
                    x: a.y*b.z - a.z*b.y,
                    y: a.z*b.x - a.x*b.z,
                    z: a.x*b.y - a.y*b.x
                } } ),
            [ a.kind === Mat4 && b.kind === Vec4 ] : ( a, b ) => ({ kind: Vec4,
                result: {
                    x: b.x*a.m11 + b.y*a.m12 + b.z*a.m13 + b.w*a.m14,
                    y: b.x*a.m21 + b.y*a.m22 + b.z*a.m23 + b.w*a.m24,
                    z: b.x*a.m31 + b.y*a.m32 + b.z*a.m33 + b.w*a.m34,
                    w: b.x*a.m41 + b.y*a.m42 + b.z*a.m43 + b.w*a.m44,
                } } ),
            [ a.kind === Mat3 && b.kind === Vec3 ] : ( a, b ) => ({ kind: Vec3,
                result: {
                    x: b.x*a.m11 + b.y*a.m12 + b.z*a.m13,
                    y: b.x*a.m21 + b.y*a.m22 + b.z*a.m23,
                    z: b.x*a.m31 + b.y*a.m32 + b.z*a.m33,
                } } ),
            [ a.kind === Mat3 && b.kind === Mat3 ]: ( a, b, v ) => 
                ( {kind: Mat3, result: [
                    v(1,1), v(1,2), v(1,3),
                    v(2,1), v(2,2), v(2,3),
                    v(3,1), v(3,2), v(3,3),
                ] } ),
            [ a.kind === Mat4 && b.kind === Mat4 ]: ( a, b, v ) => 
                ( {kind: Mat4, result: [
                    v(1,1), v(1,2), v(1,3), v(1,4),
                    v(2,1), v(2,2), v(2,3), v(2,4),
                    v(3,1), v(3,2), v(3,3), v(3,4),
                    v(4,1), v(4,2), v(4,3), v(4,4),
                ] } ),
        }[ true ] )( 
            a.source, b.source,
            (ai,bi) => [1,2,3,4].reduce( (e,j) => e + a.source['m'+ai+j] * b.source['m'+j+bi], 0 )
        ),
        '+': ( a, b ) => ( a, b ) => typeError( '+', a.kind, b.kind ), // { result, kind }
        '-': ( a, b ) => ( a, b ) => typeError( '-', a.kind, b.kind ), // { result, kind }
        '/': ( a, b ) => ( a, b ) => typeError( '/', a.kind, b.kind ), // { result, kind }
        '.': ( a, b ) => ( a, b ) => typeError( '.', a.kind, b.kind ), // { result, kind }

        //a and b are { source, kind }
        //verify kind compatibility, select copier, apply, return null
        _set: ( a, b ) => {}, // null
    }
    //return: { result{x:,y:,...}, kind: Num|Vec2|... }

    let dotOperator = false;

    const library = {};
    const access = [];

    const Num = 0;
    const Vec2 = 1;
    const Vec3 = 2;
    const Vec4 = 3;
    const Mat3 = 4;
    const Mat4 = 5;
    const kindNames = [ 'Num', 'Vec2', 'Vec3', 'Vec4', 'Mat4' ];


    //alias vector properties with array indices
    const map3 = [
        'm11', 'm12', 'm13',
        'm21', 'm22', 'm23',
        'm31', 'm32', 'm33'
    ];
    const map4 = [
        'm11', 'm12', 'm13', 'm14',
        'm21', 'm22', 'm23', 'm24',
        'm31', 'm32', 'm33', 'm34',
        'm41', 'm42', 'm43', 'm44'
    ];

    const Construct = ( source, name, kind ) => {

        const id = key();

        const def = m => ( { 
            get: () => source[ m ], 
            set: v => source[ m ] = v,
            enumerable: true,
        } );
        const alias = ( k, i ) => {
            Object.defineProperty( source, k, def( i ) );
        }

        if( kind === Num ) alias( 'value', 'x' );
        if( kind in [ Num, Vec2, Vec3, Vec4 ] ) alias( '0', 'x' );
        if( kind in [ Vec2, Vec3, Vec4 ] ) alias( '1', 'y' );
        if( kind in [ Vec3, Vec4 ] ) alias( '2', 'z' );
        if( kind in [ Vec4 ] ) alias( '3', 'w' );
        if( kind === Mat3 ) map3.forEach( alias );
        if( kind === Mat4 ) map4.forEach( alias );

        const construct = new Proxy( source, {

            get( source, k ) {

                if( k === Symbol.toPrimitive ) {
                    //inline usage chain
                    //Vector[ varA ] * Vector[ varB ]
                    return () => id;
                }

                if( k === Symbol.iterator ) {
                    //iterate
                    let i = 0;
                    return function* () {
                        while( i in source ) yield source[ i++ ];
                    }
                }

                if( source.hasOwnProperty( k ) ) {

                    //must be able to remove parent access from current chain
                    if( access[ access.length - 1 ] !== id ) {
                        access.length = 0;
                        throw `${libraryName}[ '${name}' ]: Illegal access [${k}] from stranded reference`;
                    }

                    //property accessor, remove parent access from chain
                    access.pop();

                    return source[ k ];
                }

                if( k === libraryName ) {
                    // Vector[ varA ] . Vector[ varB ]
                    return new Proxy( {
                        get( k2 ) {
                            if( library.hasOwnProperty( k2 ) ) {
                                const name = k2;
                                dotOperator = Object.freeze( { name } );
                                return dotOperator;
                            } else {
                                dotOperator = false;
                                access.length = 0;
                                throw `${libraryName}[ '${name}' ]: Illegal dot operator, ${libraryName}[ '${k2}' ] is undefined`
                            }
                        }
                    } );
                }

                if( k === 'toString' ) {
                    //Vector[ varA ].toString()
                    return () => JSON.stringify( source );
                }

                if( k === 'join' ) {
                    //Vector[ varA ].join()
                    return {
                        [ Num ]: c => c,
                        [ Vec2 ]: c => [ source.x, source.y ].join( c ),
                        [ Vec3 ]: c => [ source.x, source.y, source.z ].join( c ),
                        [ Vec4 ]: c => [ source.x, source.y, source.z, source.w ].join( c ),
                        [ Mat3 ]: c => source.join( c ),
                        [ Mat4 ]: c => source.join( c ),
                    }[ kind ]

                }

                return undefined;

            },

            set( source, k, n ) {
                if( source.hasOwnProperty( k ) ) {
                    source[ k ] = n;
                    return n;
                }

                return undefined;
            }

        } );
        
        library[ name ] = { id, construct, kind, source }

        return construct;

    }


    return new Proxy( library, {

        get ( v, k ) {

            if( k.indexOf( 'LITERAL' ) === 0 ) {

                throw `${libraryName}[ '${k}' ]: Reserved name`;

            }

            if( isNaN( k ) ) {

                if( k.indexOf( ',' ) > -1 ) {

                    const array = k.split( ',' ).map( n => isNaN( n ) ? null : 1*n );
                    if( areNumbers( array ) ) {

                        //TODO: k may be joined array, allow LITERAL_VEC3, etc.
                        const kind = {
                            [ true ]: null,
                            [ array.length === 2]: Vec2,
                            [ array.length === 3]: Vec3,
                            [ array.length === 4]: Vec4,
                            [ array.length === 4]: Vec4,
                            [ array.length === 9]: Mat3,
                            [ array.length === 16]: Mat4,
                        }[ true ];

                        if( kind === null ) throw `${libraryName} illegal literal`;

                        const name = {
                            Vec2: 'LITERAL_VEC2',
                            Vec3: 'LITERAL_VEC3',
                            Vec4: 'LITERAL_VEC4',
                            Mat3: 'LITERAL_MAT3',
                            Mat4: 'LITERAL_MAT4',
                        }[ kind ];

                        if( ! library.hasOwnProperty( name ) ) 
                            return Construct( array, name, kind );

                        else {
                            const destination = library[ name ];
                            ops._set( destination, { source: array, kind } );
                            return destination;
                        }
                    }
                    else {
                        throw `${libraryName} illegal literal`;
                    }

                }

                const name = k;

                //k is identifier
                if( library.hasOwnProperty( k ) ) {
                    //k is existing construct
                    const { id, construct } = library[ name ];

                    access.push( { id, name } );
                    return construct;
                }

                else throw `${libraryName}[ '${k}' ] is undefined`;

            }

            else {
             
                const name = 'LITERAL';
                const x = 1 * k;

                if( ! library[ name ] ) {
                    
                    Construct( { x }, name, Num );

                }

                const { id, construct, source } = library[ name ];

                source.x = x;

                access.push( { id, name } );
                return construct;
            }

        },

        set ( v, k, o ) {

            if( k === 'LITERAL' ) {

                throw `${libraryName}[ '${k}' ]: Reserved name`;

            }

            if( access.length === 0 ) {
                //construction from external source
                if( isNaN( k ) ) {

                    const name = k;

                    const fail = () => { throw `${libraryName}[ '${name}' ]: Illegal constructor`; }

                    if( typeof o === 'object' ) {

                        const fromNames = ( ( x,y,z,w ) => ( {
                            [ true ]: () => null,
                            [ typeof x === 'number' ]: () => Construct( { x }, name, Num ),
                            [ typeof y === 'number' ]: () => Construct( { x,y }, name, Vec2 ),
                            [ typeof z === 'number' ]: () => Construct( { x,y,z }, name, Vec3 ),
                            [ typeof w === 'number' ]: () => Construct( { x,y,z,w }, name, Vec4 ),
                        }[ true ] ) )( o.x, o.y, o.z, o.w )()

                        if( fromNames !== null ) return fromNames;

                        const fromIterable = 
                            ( typeof o[ Symbol.iterator ] !== 'function' ) ?
                            null :
                            ( ( x,y,z,w,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15 ) => ( {
                                [ true ]: () => null,
                                [ typeof x === 'number' ]: () => Construct( { x }, name, Num ),
                                [ areNumbers( x,y ) ]: () => Construct( { x,y }, name, Vec2 ),
                                [ areNumbers( x,y,z ) ]: () => Construct( { x,y,z }, name, Vec3 ),
                                [ areNumbers( x,y,z,w ) ]: () => Construct( { x,y,z,w }, name, Vec4 ),
                                [ areNumbers( x,y,z,w,m4,m5,m6,m7,m8 ) ]: 
                                    () => Construct( [ 
                                        x,  y,  z,
                                        w,  m4, m5,
                                        m6, m7, m8
                                     ], name, Mat3 ),
                                [ areNumbers( x,y,z,w,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15 ) ]: 
                                    () => Construct( [ 
                                        x,   y,   z,   w,
                                        m4,  m5,  m6,  m7,
                                        m8,  m9,  m10, m11,
                                        m12, m13, m14, m15
                                     ], name, Mat4 ),
                            }[ true ] ) )( ...o )();

                        if( fromIterable !== null ) return fromIterable;

                        fail();

                    } else if( typeof o === 'number' ) {

                        const x = o;
                        return Construct( { x }, name, Num );

                    } else fail()

                } else {
                    //attempt set literal numeric
                    throw `${libraryName}[ ${k} ]: Illegal constructor: Name must not be a number`;
                }

            }

            else {

                if( o === dotOperator ) {

                    //dot operator

                    const a = library[ access[ 0 ].name ];
                    const b = library[ dotOperator.name ];

                    dotOperator = false;
                    
                    const { result: resultObject, kind: resultKind } = ops[ '.' ]( a, b );

                    const destinationName = k;

                    if( ! library.hasOwnProperty( destinationName ) )

                        return Construct( resultObject, destinationName, resultKind );

                    else {
                        
                        const destination = library[ destinationName ];

                        const { construct: destinationConstruct, source: destinationObject, kind: destinationKind } = destination;

                        if( resultKind !== destinationKind ) {

                            const resultKindName = kindNames[ resultKind ];
                            const destinationKindName = kindNames[ destinationKind ];

                            throw `${libraryName}[ '${destinationName}' ]: Type Error. Required = <${destinationKindName}>, got = <${resultKindName}>`;

                        }

                        ops._set( destination, { source: resultObject, kind: resultKind} );

                        return destinationConstruct;

                    }

                }

                //bad expression
                if( access.length > 2 ) throw `${libraryName} expressions must access no more than 2 keys`;

                if( access.length === 1 ) {

                    const { id, name } = access[ 0 ];


                    //copy
                    if( o === library[ name ].construct ) {

                        const copyName = k;
                        const { source, kind } = library[ name ];

                        const { x,y,z,w,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13,m14,m15 } = source;

                        access.length = 0;

                        return ( {
                            [ Num ]: () => Construct( { x }, copyName, Num ),
                            [ Vec2 ]: () => Construct( { x,y }, copyName, Vec2 ),
                            [ Vec3 ]: () => Construct( { x,y,z }, copyName, Vec3 ),
                            [ Vec4 ]: () => Construct( { x,y,z,w }, copyName, Vec4 ),
                            [ Mat3 ]: () =>
                                Construct( [
                                    x,  y,  z,
                                    w,  m4, m5,
                                    m6, m7, m8
                                ], name, Mat3 ),
                            [ Mat4 ]: () =>
                                Construct( [
                                    x,   y,   z,   w,
                                    m4,  m5,  m6,  m7,
                                    m8,  m9,  m10, m11,
                                    m12, m13, m14, m15
                                ], name, Mat4 ),
                        }[ kind ] )()
    
                    } 
                    
                    //may have tried expression using both accessor and literal.
                    else {

                        access.length = 0;
                        
                        throw `${libraryName}[ '${k}' ]: Illegal expression`;

                    }

                }

                if( access.length === 2 ) {

                    //compute chain
                    const [ a, b ] = access;

                    op = {
                        [ true ]: null,
                        [ a.id * b.id ]: '*', //multiply
                        [ a.id + b.id ]: '+', //add
                        [ a.id - b.id ]: '-', //subtract
                        [ a.id / b.id ]: '/', //divide
                    }[ o ];

                    if( op === null ) throw `${libraryName}[ 'k' ]: Illegal expression`;

                    else {

                        const a = library[ access[ 0 ].name ];
                        const b = library[ access[ 1 ].name ];

                        const { result: resultObject, kind: resultKind } = ops[ op ]( a, b );

                        const destinationName = k;

                        if( ! library.hasOwnProperty( destinationName ) ) {

                            return Construct( resultObject, destinationName, resultKind );

                        }

                        else {

                            const destination = library[ k ];

                            ops._set( destination, { source: resultObject, kind: resultKind } );

                        }

                    }

                }

            }

        }

    } )

}
