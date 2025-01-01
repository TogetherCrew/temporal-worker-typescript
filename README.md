## Neo4j

### Constraints
This should be run at deployment.


#### Discourse
```
CREATE CONSTRAINT FOR (obj:DiscoursePost) REQUIRE (obj.topicId, obj.endpoint, obj.postNumber) IS UNIQUE;
CREATE CONSTRAINT FOR (obj:DiscoursePost) REQUIRE (obj.id, obj.endpoint) IS UNIQUE;
CREATE CONSTRAINT FOR (obj:DiscourseTopic) REQUIRE (obj.id, obj.endpoint) IS UNIQUE;
CREATE CONSTRAINT FOR (obj:DiscourseUser) REQUIRE (obj.id, obj.endpoint) IS UNIQUE;
CREATE CONSTRAINT FOR (obj:DiscourseCategory) REQUIRE (obj.id, obj.endpoint) IS UNIQUE;
```

### Deleting nodes and edges
Warning: make sure you know what your doing.

#### Discourse
```
MATCH (n:DiscoursePost)
DETACH DELETE n;

MATCH (n:DiscourseTopic)
DETACH DELETE n;

MATCH (n:DiscourseUser)
DETACH DELETE n;
```