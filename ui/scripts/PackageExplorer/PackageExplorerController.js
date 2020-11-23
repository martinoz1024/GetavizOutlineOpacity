var packageExplorerController = (function () {

	let packageExplorerTreeID = "packageExplorerTree";
	let jQPackageExplorerTree = "#packageExplorerTree";

	let tree;

	var entityTypesForSearch = ["Namespace", "Class", "Interface", "Report", "FunctionGroup"];
	
    var elementsMap = new Map();

		const domIDs = {
		zTreeDiv: "zTreeDiv",
		searchDiv: "searchDiv",
		searchInput: "searchField"
	}

	let controllerConfig = {

		elements: [],

		elementsSelectable: true,

		showSearchField: true,
		entityTypesForSearch: entityTypesForSearch,
		//abap specific
		useMultiselect: true,


	};

	var selectedEntities = [];

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

        controllerConfig.elements.forEach(function (element) {
			elementsMap.set(element.type, element.icon);
		});
	}

	function activate(rootDiv) {

		if (controllerConfig.showSearchField) {
			//search field
			let searchDiv = document.createElement("DIV");
			searchDiv.id = domIDs.searchDiv;
			searchDiv.setAttribute("ignoreTheme", "true");

			const cssLink = document.createElement("link");
			cssLink.type = "text/css";
			cssLink.rel = "stylesheet";
			cssLink.href = "scripts/PackageExplorer/tt.css";
			document.getElementsByTagName("head")[0].appendChild(cssLink);

			//create search input field
			const searchInput = document.createElement("INPUT");
			searchInput.id = domIDs.searchInput;
			searchInput.type = "text";

			searchDiv.appendChild(searchInput);
			rootDiv.appendChild(searchDiv);

			$("#" + domIDs.searchInput).jqxInput({ theme: "metro", width: "100%", height: "30px", placeHolder: "Search" });
		}

		//create zTree div-container
		let zTreeDiv = document.createElement("DIV");
		zTreeDiv.id = domIDs.zTreeDiv;

		let packageExplorerTreeUL = document.createElement("UL");
		packageExplorerTreeUL.id = packageExplorerTreeID;
		packageExplorerTreeUL.setAttribute("class", "ztree");

		zTreeDiv.appendChild(packageExplorerTreeUL);
		rootDiv.appendChild(zTreeDiv);

		//create zTree
		prepareTreeView();

		if (controllerConfig.showSearchField) {
			initializeSearch();
		}

		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	function reset() {
		prepareTreeView();
	}

	function initializeSearch() {
		var relevantEntities = [];

		model.getAllEntities().forEach(function(entity) {
			if (entityTypesForSearch.includes(entity.type)) {
				//ignore local classes and local interfaces
				if ((entity.type === "Class" || entity.type === "Interface") && entity.belongsTo.type !== "Namespace") {
					return;
				}
				relevantEntities.push(entity);
			}
		})

		var suggestions = new Bloodhound({
			local: relevantEntities,
			datumTokenizer: function (entity) {
				return Bloodhound.tokenizers.whitespace(entity.name);
			},
			queryTokenizer: Bloodhound.tokenizers.whitespace,
			limit: 20
		});
		suggestions.initialize();

		$("#" + domIDs.searchInput).typeahead(
			{
				hint: true,
				highlight: true,
				minLength: 3
			}, {
			name: "suggestions",
			// displayKey: "qualifiedName",
			source: suggestions.ttAdapter(),
			templates: {
				empty: Handlebars.compile('<div class="result"><p>no entities found</p></div>'),
				suggestion: Handlebars.compile('<div class="result"><p class="name">{{name}}</p><p class="entityType">{{type}}</p></div>')
			}
		});

        $("#" + domIDs.searchInput).on("typeahead:selected", function(event, suggestion) {
			publishSelectEvent(undefined, undefined, { id: suggestion.id }, undefined);		
        });	
	}

	

	function prepareTreeView() {

		let entities = model.getCodeEntities();
		items = [];

		//build items for ztree
		entities.forEach(function (entity) {
			var item;
			if(elementsMap.has(entity.type)){
				var icon = elementsMap.get(entity.type);

				var parentId = "";
				if (entity.belongsTo !== undefined) {
					parentId = entity.belongsTo.id;
				}
				item = {
					id: entity.id,
					open: false,
					checked: true,
					parentId: parentId,
					name: entity.name,
					icon: icon, 
					iconSkin: "zt"
				};
				items.push(item);
			}
		});

		//Sortierung nach Typ und Alphanumerisch
		/*items.sort(
			function (a, b) {

				var sortStringA = "";
				switch (a.icon) {
					case controllerConfig.packageIcon:
						sortStringA = "1" + a.name.toUpperCase();
						break;
					case controllerConfig.typeIcon:
						sortStringA = "2" + a.name.toUpperCase();
						break;
					case controllerConfig.fieldIcon:
						sortStringA = "3" + a.name.toUpperCase();
						break;
					case controllerConfig.methodIcon:
						sortStringA = "4" + a.name.toUpperCase();
						break;
					default:
						sortStringA = "0" + a.name.toUpperCase();
				}

				var sortStringB = "";
				switch (b.icon) {
					case controllerConfig.packageIcon:
						sortStringB = "1" + b.name.toUpperCase();
						break;
					case controllerConfig.typeIcon:
						sortStringB = "2" + b.name.toUpperCase();
						break;
					case controllerConfig.fieldIcon:
						sortStringB = "3" + b.name.toUpperCase();
						break;
					case controllerConfig.methodIcon:
						sortStringB = "4" + b.name.toUpperCase();
						break;
					default:
						sortStringB = "0" + b.name.toUpperCase();
						break;
				}

				if (sortStringA < sortStringB) {
					return -1;
				}
				if (sortStringA > sortStringB) {
					return 1;
				}

				return 0;
			}
		);*/

		//zTree settings
		var settings = {
			check: {
				enable: controllerConfig.elementsSelectable,
				chkboxType: { "Y": "ps", "N": "s" }
			},
			data: {
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "parentId",
					rootPId: ""
				}
			},
			callback: {
				onCheck: zTreeOnCheck,
				onClick: publishSelectEvent,
			},
			view: {
				showLine: false,
				showIcon: true,
				selectMulti: false
			}

		};

		//create zTree
		tree = $.fn.zTree.init($(jQPackageExplorerTree), settings, items);
	}

	function createItem(entry, entity) {
		
		let item = {
			id: entity.id,
			open: false,
			checked: true,
			parentId: entity.belongsTo.id,
			name: entity.name,
			type: entry.type,
			icon: entry.icon,
			iconSkin: "zt"
		};
		items.push(item);
	
	}


	function zTreeOnCheck(event, treeId, treeNode) {
		var nodes = tree.getChangeCheckedNodes();

		var entities = [];
		nodes.forEach(function (node) {
			node.checkedOld = node.checked; //fix zTree bug on getChangeCheckedNodes	
			entities.push(model.getEntityById(node.id));
		});


		var applicationEvent = {
			sender: packageExplorerController,
			entities: entities
		};

		if (!treeNode.checked) {
			events.filtered.on.publish(applicationEvent);
		} else {
			events.filtered.off.publish(applicationEvent);
		}

	}

	function publishSelectEvent(treeEvent, treeId, treeNode, eventObject) {

		clickedEntity = model.getEntityById(treeNode.id);

		var alreadySelected = clickedEntity === selectedEntities[0];

		//always deselect the previously selected entities
		if (selectedEntities.size != 0) {
			var unselectEvent = {
				sender: packageExplorerController,
				entities: selectedEntities
			}

			events.selected.off.publish(unselectEvent);
		};

		//select the clicked entities only if the clicked entities are not already selected
		//otherwise the clicked entities should only be deselected
		if (!alreadySelected) {
			var newSelectedEntities = new Array();

			newSelectedEntities.push(clickedEntity);

			if (controllerConfig.useMultiselect) {
				newSelectedEntities = newSelectedEntities.concat(model.getAllChildrenOfEntity(clickedEntity));
			}
			var selectEvent = {
				sender: packageExplorerController,
				entities: newSelectedEntities

			};
			events.selected.on.publish(selectEvent);
		}
	}

	function selectNode(entityID) {
		var item = tree.getNodeByParam("id", entityID, null);
		tree.selectNode(item, false);
	}

	function unselectNode(entityID) {
		var item = tree.getNodeByParam("id", entityID, null);
		tree.cancelSelectedNode(item, false);
	}

	function onEntitySelected(applicationEvent) {
		var selectedEntity = applicationEvent.entities[0];
		selectedEntities = applicationEvent.entities;

		selectNode(selectedEntity.id);

		if (controllerConfig.showSearchField) {
			$("#" + domIDs.searchInput).val(selectedEntity.name);
		}
	}

	function onEntityUnselected(applicationEvent) {
		unselectNode(applicationEvent[0]);

		if (controllerConfig.showSearchField) {
			$("#" + domIDs.searchInput).val("");
		}

		selectedEntities = new Array();
	}

	return {
		initialize: initialize,
		activate: activate,
		reset: reset
	};
})();