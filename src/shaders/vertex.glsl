// テクスチャ座標（UV座標）を保持するための変数です。
// varyingは頂点シェーダーからフラグメントシェーダー（fragment shader）に値を渡すための修飾子です。
varying vec2 vUv;

void main() {
    //  頂点シェーダー内で、vUv変数に現在の頂点のテクスチャ座標（uv）を代入しています。
    // これにより、この頂点のテクスチャ座標がフラグメントシェーダーに渡されます。
    vUv = uv;

    // mvPositionは、モデルビューマトリックス（modelViewMatrix）を頂点の位置（position）に乗算した結果を保持する変数です。
    // モデルビューマトリックスは、カメラの視点から見たワールド座標をビュー座標に変換するために使用されます。
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 頂点のクリッピング座標を表す組み込み変数です。
    // ここでは、ビュー座標（mvPosition）をプロジェクションマトリックス（projectionMatrix）で変換し、
    // 最終的なクリッピング座標を計算してgl_Positionに代入しています。
    // これにより、3Dオブジェクトがカメラの視野に収まるようにクリッピングされます。
    gl_Position = projectionMatrix * mvPosition;
}