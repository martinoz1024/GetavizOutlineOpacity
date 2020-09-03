package org.getaviz.generator.abap.city.steps;

import com.sun.org.apache.bcel.internal.generic.IF_ACMPEQ;
import org.apache.commons.lang3.math.NumberUtils;
import org.getaviz.generator.SettingsConfiguration;
import org.getaviz.generator.abap.enums.SAPNodeProperties;
import org.getaviz.generator.abap.enums.SAPRelationLabels;
import org.getaviz.generator.abap.repository.ACityElement;
import org.getaviz.generator.abap.repository.ACityRepository;
import org.getaviz.generator.abap.repository.SourceNodeRepository;
import org.getaviz.generator.database.DatabaseConnector;
import org.getaviz.run.local.common.Maps;
import org.neo4j.driver.v1.StatementResult;
import org.neo4j.driver.v1.types.Node;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.*;

public class ACityMetaDataExporter {
    private static SettingsConfiguration config = SettingsConfiguration.getInstance();
    private static DatabaseConnector connector = DatabaseConnector.getInstance(config.getDefaultBoldAddress());
    private SourceNodeRepository nodeRepository;
    private ACityRepository aCityRepository;

    public ACityMetaDataExporter(ACityRepository aCityRepository, SourceNodeRepository sourceNodeRepository) {
        this.nodeRepository = sourceNodeRepository;
        this.aCityRepository = aCityRepository;
    }

    public void exportMetaDataFile() {
        Writer fw = null;
        try {
            File outputDir = new File(config.getOutputMap());
            String path = outputDir.getAbsolutePath() + "/metaData.json";
            fw = new FileWriter(path);
            fw.write(toJSON(nodeRepository.getNodes()));
        } catch (IOException e) {
            System.out.println(e);
        } finally {
            if (fw != null)
                try {
                    fw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
    }

    public void setMetaDataPropToACityElements() {
        Collection<Node> nodes = nodeRepository.getNodes();
        for (final Node node : nodes) {
            String metaData = toMetaData(node);
            ACityElement aCityElement = aCityRepository.getElementBySourceID(node.id());
            if (aCityElement == null) {
                continue;
            }

            aCityElement.setMetaData("{" + metaData + "}");
        }
    }

    private String toJSON(Collection<Node> nodes) {
        StringBuilder metaDataFile = new StringBuilder();
        boolean hasElements = false;
        for (final Node node : nodes) {
            // Some elements are not in aCityRep; Example - standard SAP-packages
            ACityElement element = aCityRepository.getElementBySourceID(node.id());
            if (element == null) {
                continue;
            }

            if (!hasElements) {
                hasElements = true;
                metaDataFile.append("[{");
            } else {
                metaDataFile.append("\n},{");
            }
            metaDataFile.append("\n");
            metaDataFile.append(toMetaData(node));
        }
        if (hasElements) {
            metaDataFile.append("}]");
        }
        return metaDataFile.toString();
    }

    private String toMetaData(Node node) {
        StringBuilder builder = new StringBuilder();
        ACityElement element = aCityRepository.getElementBySourceID(node.id());

        Arrays.asList(SAPNodeProperties.values()).forEach(prop -> {
            if (prop == SAPNodeProperties.element_id) {
                if (element != null) {
                    builder.append("\""+ Maps.getMetaDataProperty(prop.toString()) + "\": \"" + element.getHash() + "\"," +"\n");
                }

                return; // Jump to the next prop
            }

            // If there is no value for property, then don't write
            if (node.get(prop.toString()).isNull()) {
                return;
            }

            // Remove extra "" (written by Neo4j)
            String propValue = node.get(prop.toString()).toString().replaceAll("\"", "");

            // Belongs to - must be hash value of a parent container
            if (prop == SAPNodeProperties.container_id) {
                propValue = getContainerHash(node);
            }

            // Write strings with ""-signs and numbers without
            if (NumberUtils.isCreatable(propValue)) {
                builder.append("\""+ Maps.getMetaDataProperty(prop.toString()) + "\": " + propValue + "," + "\n");
            } else {
                builder.append("\""+ Maps.getMetaDataProperty(prop.toString()) + "\": \"" + propValue + "\"," + "\n");
            }
        });

        // Add USES and INHERIT relations
        String nodeType = node.get("type").asString();
        if (Maps.getNodesWithUsesRelationByType().contains(nodeType)) {
            builder.append("\"calls\": \"" + getRelations(node, SAPRelationLabels.USES, true) + "\",\n");
            builder.append("\"calledBy\": \"" + getRelations(node, SAPRelationLabels.USES, false) + "\",\n");
        }

        if (Maps.getNodesWithInheritRelationByType().contains(nodeType)) {
            builder.append("\"subClassOf\": \"" + getRelations(node, SAPRelationLabels.INHERIT, true) + "\",\n");
            builder.append("\"superClassOf\": \"" + getRelations(node, SAPRelationLabels.INHERIT, false) + "\",\n");
        }

        //qualifiedName
        builder.append("\"qualifiedName\": \"" + getQualifiedName(node) + "\",\n");

        //signature for methods
        if (node.get("type").asString().equals("METH")) {
            builder.append("\"signature\": \"" + "" + "\",\n");
        }

        // Make sure we have the right syntax -> no commas at the end
        char lastChar = builder.charAt(builder.length() - 1);
        if (Character.compare(lastChar, '\n') == 0) {
            lastChar = builder.charAt(builder.length() - 2);

            if (Character.compare(lastChar, ',') == 0) {
                builder.deleteCharAt(builder.length() - 1); // Delete '\n'
                builder.deleteCharAt(builder.length() - 1); // Delete ,
            }
        }

        return builder.toString();
    }

    private String getQualifiedName(Node node) {
        List<String> nodesHashes = new ArrayList<>();
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        return "";
    }

    private String getContainerHash(Node node) {
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        if (parentNodes.isEmpty()) {
            return "";
        }

        // Make sure we get direct parent
        String container_id = node.get(SAPNodeProperties.container_id.name()).asString();
        for (Node parentNode: parentNodes) {
            String element_id = parentNode.get(SAPNodeProperties.element_id.name()).asString();
            if (element_id.equals(container_id)) {
                ACityElement parentElement = aCityRepository.getElementBySourceID(parentNode.id());
                // Some SAP standard packages may not included
                if (parentElement == null) {
                    return "";
                }
                return parentElement.getHash();
            }
        }

        // If no hash was found, for example default SAP packages, no container_id will be written.
        return "";
    }

    private String getRelations(Node node, SAPRelationLabels label, Boolean direction) {
        Collection<Node> nodes = nodeRepository.getRelatedNodes(node, label, direction);
        if (nodes.isEmpty()) {
            return "";
        }

        List<String> nodesHashes = getNodesHashes(nodes);
        return String.join(", ", nodesHashes); //returns "hash, hash_2, hash*"
    }

    private List<String> getNodesHashes(Collection<Node> nodes) {
        List<String> nodesHashes = new ArrayList<>();
        for (Node node : nodes) {
            Long nodeId = node.id();
            ACityElement aCityElement = aCityRepository.getElementBySourceID(nodeId);
            if (aCityElement == null) {
                continue;
            }

            nodesHashes.add(aCityElement.getHash());
        }
        return nodesHashes;
    }
}
