const e=[{label:"Subject",fieldname:"subject",fieldtype:"Data"},{label:"Status",fieldname:"status",fieldtype:"Select",options:`Open
Completed
Cancelled`},{label:"Priority",fieldname:"priority",fieldtype:"Autocomplete",options:`High
Medium
Low`},{label:"Task Description",fieldname:"description   ",fieldtype:"Long Text"},{label:"Dependent Tasks",fieldname:"depends_on",fieldtype:"Table",options:[{fieldname:"task",fieldtype:"Link",label:"Task",options:"Task"},{fieldname:"subject",fieldtype:"Text",label:"Subject"}]}],t="Task Todo",l="Task",a=0,i={pwa_form_fields:e,form_name:t,doctype_name:l,is_submittable:a};export{i as default,l as doctype_name,t as form_name,a as is_submittable,e as pwa_form_fields};
