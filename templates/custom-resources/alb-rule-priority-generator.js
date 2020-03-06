'use strict';const aws=require("aws-sdk");let defaultResponseURL,report=function(a,b,c,d,e,f){return new Promise((g,h)=>{const i=require("https"),{URL:j}=require("url");var k=JSON.stringify({Status:c,Reason:f,PhysicalResourceId:d||b.logStreamName,StackId:a.StackId,RequestId:a.RequestId,LogicalResourceId:a.LogicalResourceId,Data:e});const l=new j(a.ResponseURL||defaultResponseURL),m={hostname:l.hostname,port:443,path:l.pathname+l.search,method:"PUT",headers:{"Content-Type":"","Content-Length":k.length}};i.request(m).on("error",h).on("response",a=>{a.resume(),400<=a.statusCode?h(new Error(`Error ${a.statusCode}: ${a.statusMessage}`)):g()}).end(k,"utf8")})};const calculateNextRulePriority=async function(a){var b,c=new aws.ELBv2,d=[];do{const e=await c.describeRules({ListenerArn:a,Marker:b}).promise();d=d.concat(e.Rules),b=e.NextMarker}while(b);let e=1;if(0<d.length){const a=d.map(a=>"default"===a.Priority?0:parseInt(a.Priority)),b=Math.max(...a);e=b+1}return e};exports.nextAvailableRulePriorityHandler=async function(a,b){var c,d,e={};try{switch(a.RequestType){case"Create":d=await calculateNextRulePriority(a.ResourceProperties.ListenerArn),e.Priority=d,c=`alb-rule-priority-${a.LogicalResourceId}`;break;case"Update":case"Delete":c=a.PhysicalResourceId;break;default:throw new Error(`Unsupported request type ${a.RequestType}`);}await report(a,b,"SUCCESS",c,e)}catch(d){console.log(`Caught error ${d}.`),await report(a,b,"FAILED",c,null,d.message)}},exports.withDefaultResponseURL=function(a){defaultResponseURL=a};