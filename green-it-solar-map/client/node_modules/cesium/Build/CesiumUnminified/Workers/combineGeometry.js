/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.133.1
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  PrimitivePipeline_default
} from "./chunk-XMIVNU5H.js";
import {
  createTaskProcessorWorker_default
} from "./chunk-CZGSJ6ZG.js";
import "./chunk-WNEY4A5P.js";
import "./chunk-PFUF2QIK.js";
import "./chunk-VQLQAENU.js";
import "./chunk-DJCPJJSP.js";
import "./chunk-7P7R7ERW.js";
import "./chunk-ECGKCTPM.js";
import "./chunk-4MCKK5XE.js";
import "./chunk-JIXKGUWR.js";
import "./chunk-JVNWWKXF.js";
import "./chunk-LYKXQPGW.js";
import "./chunk-UUXKGCBU.js";
import "./chunk-YW2UXIBU.js";
import "./chunk-LSYTMSIQ.js";
import "./chunk-E2533KCN.js";
import "./chunk-DNMSVJ4S.js";
import "./chunk-4Z7AGRTU.js";
import "./chunk-7FEVXX5D.js";
import "./chunk-UXIZVXIR.js";

// packages/engine/Source/Workers/combineGeometry.js
function combineGeometry(packedParameters, transferableObjects) {
  const parameters = PrimitivePipeline_default.unpackCombineGeometryParameters(packedParameters);
  const results = PrimitivePipeline_default.combineGeometry(parameters);
  return PrimitivePipeline_default.packCombineGeometryResults(
    results,
    transferableObjects
  );
}
var combineGeometry_default = createTaskProcessorWorker_default(combineGeometry);
export {
  combineGeometry_default as default
};
