# Overview: Javascript Operator Overloading

A vector math library using overloaded operators on proxy properties: ```Vector.a = Vector.b * Vector.c```

<br />

This code is for research purposes only, as this method has no apparent practical applications.

# Example

Create and multiply 2 vectors.
```JavaScript
const libraryName = 'V';
const V = new OperatorVectorLibrary( libraryName );

V.a = [ 1,2,3 ];
V.b = [ 4,5,6 ];

V.c = V.a * V.b;


//result:
V.c[ 'x' ] === -3; //true
V.c[ 'y' ] === 6; //true
V.c[ 'z' ] === -3; //true

```

Example using 'with'

```JavaScript
const libraryName = 'V';
const supportWith = true;
const V = new OperatorVectorLibrary( libraryName, supportWith );

with ( V ) {
    a = [1,2,3];
    b = [4,5,6];
    
    c = a * b;
    console.log( ...c ); //logs: -3,6,-3
    
    c = a + b;
    console.log( ...c ); //logs: 5,7,9
}
```
<br />

# Method

Our library is a proxy.  
On get, we return numeric hashes and store access sequence.  
On set, we use a hash map to discover the operator used, then compute the result.


<br />

```JavaScript
const V = new OperatorVectorLibrary(); //V is a proxy

V.a = [ 1,2,3 ]; //set trap: We generate a numeric hash for 'a', and store [1,2,3]
V.b = [ 4,5,6 ]; //set trap: We generate a numeric hash for 'b', and store [4,5,6]


V.c = V.a * V.b;
//1. get trap [@@toPrimitive]: We return numeric hashes for 'a' and 'b' and store access chain: [ a, b ]
//2. We compute a hash map entry for each operator to overload:
//     #a * #b | #a + #b | #a - #b | #a / #b
//3. set trap 'c': We fetch the computed hash from our map.
//4. on map hit, We know a, b, and the operator used (*). Compute [ -3, 6, -3 ] and store under 'c'
//5. on map miss, We throw bad expression.


//result:
V.c[ 0 ] === -3; //get trap: We chain proxies to fetch store under 'c'
V.c[ 1 ] ===  6; //get trap: We chain proxies to fetch store under 'c'
V.c[ 2 ] === -3; //get trap: We chain proxies to fetch store under 'c'
```

<br />

<br />

# OperatorVectorLibrary Usage

## Installation

Copy the library to your directory,

Then import it:
```html
<script src='OperatorVectorLibrary.js'>
```

Minified and module versions are not available. This library is not meant for production use.

<br />

## Usage

Create a library instance.

```JavaScript
const V = new OperatorVectorLibrary();
```

<br />

Only these 4 operators are supported:  
``` + - * / ```

<br />

Create new numbers, vectors, and matrices.  
All assignations use arrays.

```JavaScript
V.a = [ 5 ]; //Number: { value: 5 }
V.b = [ 1, 1 ]; //Vec2: { x:1, y:1 }
V.c = [ 0, 0, 0 ]; //Vec3: { x:0, y:0, z:0 };
V.d = [ 1, 2, 3, 4 ]; //Vec4: { x:1, y:2, z:3, w:4 }

//Matrix[3x3] (assigned, accessed, and stored internally in row-major order)
V.m3 = [
    0, 1, 2,
    3, 4, 5,
    6, 7, 8
];
/* 
Mat3: {
    m11:0, m12:1, m13:2,
    m21:3, m22:4, m23:5,
    m31:6, m32:7, m33:8,
}
*/

//Matrix[4x4] (assigned, accessed, and stored internally in row-major order)
V.m4 = [
    0,   1,   2,   3,
    4,   5,   6,   7,
    8,   9,  10,  11,
    12, 13,  14,  15
];
/* 
Mat4: {
    m11:0,  m12:1,  m13:2,  m14:3,
    m21:4,  m22:5,  m23:6,  m24:7,
    m31:8,  m32:9,  m33:10, m34:11,
    m41:12, m42:13, m43:14, m44:15
}
*/
```
Copying may also be used for assignation.
```JavaScript
V.a = V.b; //copies b into a (creates a if it does not exist)
```

<br />

**Warning!** Accessing before instantiation will throw.
```JavaScript
V.neverSet; //does not exist

> throw "V[ 'neverSet' ] is undefined"
```

<br />

Operations must use 1 operator, must only use properties of the library, and must assign to a property of the library.
```JavaScript
V.n = V.a * V.d; //Number * Vec4, scale
V.p = V.b + V.b; //Vec2 + Vec2, vector addition
V.r = V.m4 * V.d; //Mat4 * Vec4, matrix-vector multiplication
```

Literals are also allowed, but they must be arrays accessed as properties of the library.
```JavaScript
V.n = V.d * V[ [5] ]; //Vec4 * Number, scale
V.p = V.b + V[ [2,2] ]; //Vec2 + Vec2, vector addition
V.r = V.m4 * V[ [1,2,3,4] ]; //Mat4 * Vec4, matrix-vector multiplication
```
