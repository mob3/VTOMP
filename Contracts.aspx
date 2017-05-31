<!DOCTYPE HTML>
<%@ Page Language="C#" inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register tagprefix="SharePoint" namespace="Microsoft.SharePoint.WebControls" assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">

<head runat="server">
<meta name="ProgId" content="SharePoint.WebPartPage.Document" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>VariQ Task Order Management Portal</title>
<meta http-equiv="X-UA-Compatible" content="IE=10" />
<!--<SharePoint:CssRegistration Name="default" runat="server" __designer:Preview="&lt;link rel=&quot;stylesheet&quot; type=&quot;text/css&quot; href=&quot;/vtomp/_layouts/15/defaultcss.ashx?ctag=0&quot;/&gt;
" __designer:Values="&lt;P N=&#39;Name&#39; T=&#39;default&#39; /&gt;&lt;P N=&#39;EnableCssTheming&#39; Serial=&#39;AAEAAAD/////AQAAAAAAAAAEAQAAAA5TeXN0ZW0uQm9vbGVhbgEAAAAHbV92YWx1ZQABAAs&#39; /&gt;&lt;P N=&#39;InDesign&#39; T=&#39;False&#39; /&gt;&lt;P N=&#39;ID&#39; ID=&#39;1&#39; T=&#39;ctl00&#39; /&gt;&lt;P N=&#39;Page&#39; ID=&#39;2&#39; /&gt;&lt;P N=&#39;TemplateControl&#39; R=&#39;2&#39; /&gt;&lt;P N=&#39;AppRelativeTemplateSourceDirectory&#39; R=&#39;-1&#39; /&gt;"/>-->
<link rel="stylesheet" type="text/css" href="/_layouts/15/1033/styles/forms.css?rev=5iTS%2B0MC77Kfqez4xvgXdA%3D%3D"/>
<link rel="stylesheet" type="text/css" href="/_layouts/15/1033/styles/Themable/corev15.css?rev=ox%2BqLd6WTqhn6d%2FMqf2BMw%3D%3D"/>


<link rel="icon" 
      type="image/png" 
      href="../SiteAssets/variqfavicon.png">
<!-- bootstrap -->
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"/>
<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css"/>
<link rel="stylesheet" href="https://netdna.bootstrapcdn.com/font-awesome/4.0.0/css/font-awesome.css" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/css/bootstrap-datepicker.min.css" rel="stylesheet" type="text/css"/>
<!-- DataTables CSS -->
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.10/css/jquery.dataTables.min.css"/>
    <link href="../SiteAssets/vtompsite_ui_v1.css" rel="stylesheet" type="text/css" />
    <link href="../SiteAssets/VtopReg.css" rel="stylesheet" type="text/css" />
    <link href="../SiteAssets/lib/tablesort.css" rel="stylesheet" type="text/css" />
    
    <link href='https://fonts.googleapis.com/css?family=Cabin' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Titillium+Web' rel='stylesheet' type='text/css'>
</head>
<body style="padding:0 10px">
<script 
 type="text/javascript" 
 src="https://ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js">
</script>
   <SharePoint:ScriptLink name="clienttemplates.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="clientforms.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="clientpeoplepicker.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="autofill.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="sp.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="sp.runtime.js" runat="server" LoadAfterUI="true" Localizable="false"/>
    <SharePoint:ScriptLink name="sp.core.js" runat="server" LoadAfterUI="true" Localizable="false"/>

<script type="text/ecmascript" src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.3.js"></script>
<!-- bootstrap Latest compiled and minified JavaScript -->
<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
<!-- <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker.min.js"></script>-->
<script type="text/javascript">
//myApp.showPleaseWait(); // show loading msg right away, while waiting for scripts and content below to download
</script>

   <SharePoint:FormDigest ID="FormDigest1" runat="server"></SharePoint:FormDigest>
   <div id="vmform1">
   <form id="form1" runat="server"  class="form-horizontal">





<header>
<nav class="navbar navbar-default navbar-fixed-top role="navigation"">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <!-- <a title="VTOMP" class="navbar-brand" id="ctl00_onetidProjectPropertyTitleGraphic" href="/vtomp">
<img name="onetidHeadbnnr0" id="ctl00_onetidHeadbnnr2" alt="VariQ" height="40px" src="../SiteAssets/Logo.png"/></a>-->
<a class="navbar-brand brand-logo" href="#">
<img alt="VariQ Corporation" class="logo" src="../SiteAssets/Variq-small.png" title="VariQ Corporation">

</a>
<a class="navbar-text site-title" href="#">Task Order Management Portal
</a>

	<button type="button" class="navbar-toggle responsive-nav-button" data-toggle="collapse" data-target=".navbar-collapse">    
		<span class="icon-bar"></span>
    	<span class="icon-bar"></span>
    	<span class="icon-bar"></span>
    </button>

    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	  
      <ul class="nav nav navbar-nav navbar-right">
		 <li id="homeNav" class=""><a href="#/">Opportunities</a></li>
         
		 <li id="teamoverviewNav" ><a href="#/teamoverview""><!--&larr;--> Team Overview</a></li>
		 <li id="profilesNav" data-bind="hideEditor: {listName: 'Profiles', permissionKind: 'editListItems' }" style="display: none; visibility: visible;" class="">
					<a href="#/profiles">Profiles</a></li>
		<li id="editcompanyNav" data-bind="with: $root.loadContracts">
					<a data-bind="attr: { 'href': companyId }">Edit Company/Profiles</a><li>
		<li id="viewcompanyNav" data-bind="if: companyId " style="display:inline"></li>
	    
		<li id="viewcontractNav" data-bind="if: contractId " style="display:inline"></li>
	    
		<li id="viewprofileNav" data-bind="if: $root.profile.profileId " style="display:inline"></li>
		
		<!-- Vehicles drop down bar -->
		<li class="dropdown" data-bind="with: $root.loadContracts">
			<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
				<span data-bind="text: selectedVehicleOfCurrentUser"></span>
				<span class="caret"></span>
			</a>
			<ul class="dropdown-menu" data-bind="foreach: vehiclesOfCurrentUser().sort(function(l,r) { return l.name == r.name ? 0 : (l.name < r.name ? -1 : 1)} )">
				<li><a data-bind="text: name, click: $parent.change_vehicle" href="#"></a></li>
			</ul>
		</li>
        
		<!-- Admin menus -->
        <li class="dropdown" data-bind="hideEditor: {groupName: 'Admins' }">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Admin <span class="caret"></span></a>
          	<ul class="dropdown-menu">
            	<li id="listCompaniesNav" style="visibility: visible;">
					<a data-bind="attr:{href:'#/listcompanies'}" href="#/listcompanies">All Companies</a></li>          	
            	<li id="editcompanyNav" data-bind="hideEditor: $root.companyId, listName: 'Companies', permissionKind: 'editListItems'  " style="display: none; visibility: hidden;">
					<a data-bind="attr:{href:'#/editcompany/'+companyId()}" href="#/editcompany/">Edit Company</a></li>
	    		<li id="createcompanyNav" style="display: inline; visibility: visible;" class="">
					<a data-bind="attr:{href:'#/createcompany'}" href="#/createcompany">Create Company</a></li>
				<li id="editprofileNav" data-bind="hideEditor: $root.profile.profileId, listName: 'Profiles', permissionKind: 'editListItems'  " style="display: none; visibility: hidden;">
					<a data-bind="attr:{href:'#/editprofile/'+profile.profileId()}" href="#/editprofile/undefined">Edit Profile</a></li>
	    		<li id="createprofileNav" style="display: inline; visibility: visible;">
					<a data-bind="attr:{href:'#/createprofile'}" href="#/createprofile">Create Profile</a></li>
				<li id="prepublishedNav" style="visibility: visible;">
					<a data-bind="attr:{href:'#/contracts/prepublished'}" href="#/contracts/prepublished">PrePublished Opportunities</a></li>
            	<li id="editcontractNav" data-bind="hideEditor: $root.contractId, listName: 'Contracts', permissionKind: 'editListItems'" style="display: none; visibility: hidden;">
					<a data-bind="attr:{href:'#/editcontract/'+contractId()}" href="#/editcontract/">Edit Opportunity</a></li>
	   			<li id="createcontractNav" data-bind="hideEditor: {listName: 'Profiles', permissionKind: 'addListItems' }" style="visibility: visible;" class="">
					<a data-bind="attr:{href:'#/createcontract'}" href="#/createcontract">Create Opportunity</a></li>
				<li id="vehiclesNav" style="visibility: visible;">
					<a data-bind="attr:{href: '#/vehicles'}" href="#/vehicles">Vehicles</a></li>
	    		<li id="sharepointBackendNav" style="visibility: visible;">
					<a href="/vtomp_dev/_layouts/15/viewlsts.aspx">Edit SharePoint Backend</a></li>
          	</ul>
        </li>
		
	</ul>
	
	
	
	</div>
</div>

</nav>
</header> 


<!-- Sub navbar -->
<div id="mainContent" class="mainContent">
 <span data-bind="with: $root.loadContracts" style="display: none;float: right; margin-top: 10px; margin-right:10px; color:black;">Logged in as <text data-bind="text: currentUser"></text> Company ID: <text data-bind="text: companyId"></text></span>
<ol class="breadcrumb" >
  <li><a href="#">Home</a></li>
  <li data-bind="if: contractId" class="active"><a href="#">Library</a></li>
  <li data-bind="if: companyId " class="active">Data</li>
 </ol>
 




<div id="content">
<div id="resultsNote" style="display:none"><div style="display:inline" id="results"></div><div><a style="cursor: pointer;" id="close">[close]</a></div></div>
<div id="loadingContainer" style="display:none"><img style="display:inline" src="../SiteAssets/loading.gif" id="loadingGif" /></div>
<div id="contractsList" class="hidden">
</div>

<div id="profilesList" class="hidden">
</div>
<div id="profileView" class="hidden">
</div>
<div id="profileEdit" class="hidden">
</div>
<div id="profileCreate" class="hidden">
</div>

<div id="teamOverview" class="hidden">
</div>
<div id="listCompanies" class="hidden">
</div>
<div id="vehiclesPage" class="hidden clearfix" style="height:100%;">
</div>
<div id="companyDetailsView" class="hidden">
        
<div data-bind='template: "view-company-template"'></div>
</div>
 <script type="text/html" id="view-company-template">
</script>
<div id="companyEditView" class="hidden">
	<div data-bind='template: "edit-company-template"'></div>
</div>
 <script type="text/html" id="edit-company-template">
</script>
<script type="text/html" id="ChoiceLineBreakTemplate">
        <span data-bind="text: $data"></span><br>
</script>

<div id="companyCreateView" class="hidden">
</div>

<div id="contractDetailsView" class="hidden">
        
		
		
<div data-bind='template: "view-contract-template"'></div>
</div>
 <script type="text/html" id="view-contract-template">
 </script>
 <script type="text/html" id="comments-template">
 <span data-bind="text: profileName"></span> <span data-bind="if: companyName">(<span data-bind="text: companyName"></span>)</span>
 <span  data-bind="spDate:createdAtDate,dataFormat:'M/D/YYYY h:mm:ss A'" ></span>
   	<pre data-bind="text: commentText"></pre>
 	
 	<div data-bind="if: isByCurrentUser">
 	 <a href='#' data-bind='click: $root.deleteForumComment '>Delete</a>
 	 </div>
	<hr/>
 </script>
<div id="contractEditView" class="hidden">
	<div data-bind='template: "edit-contract-template"'></div> 
</div>
 <script type="text/html" id="edit-contract-template">
 </script>
<div id="contractCreateView" class="hidden">
</div>


</div><!--content-->

</div><!--main content-->

<div class="footer" style="border-top: 1px silver solid; font-size:11px; width=100%; text-align:center;">Copyright 2016 VariQ Corporation</div>
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
<script src="../SiteAssets/es6-promise.min.js"></script>
<script  type="text/javascript" src="../SiteAssets/vtompUtil.js"></script> 
<script type="text/javascript" src="../SiteAssets/lib/q.js"></script>
<script type="text/javascript" data-main="../SiteAssets/app.js" src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.22/require.js"></script>



 <script>
 (function(){
	 close = document.getElementById("close");
	 var resetResultsNote =  function() {
	   note = $("#resultsNote");
	   note.slideUp();
	   note.html('');
	 };
	if (close.addEventListener) {                    // For all major browsers, except IE 8 and earlier
	    close.addEventListener("click", resetResultsNote , false);
	} else if (close.attachEvent) {                  // For IE 8 and earlier versions
	    close.attachEvent("onclick", resetResultsNote );
	}
}());
</script>
</form>
</div>
</body>
</html>