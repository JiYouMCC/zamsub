# coding=utf-8
from decimal import Decimal

INFINITY = float('Infinity')


class Node:
    def __init__(self, label):
        self.label = label


class Edge:
    def __init__(self, to_node, length):
        self.to_node = to_node
        self.length = length


class Graph:
    def __init__(self):
        self.nodes = set()
        self.edges = dict()

    def add_node(self, node):
        self.nodes.add(node)

    def add_edge(self, from_node, to_node, length):
        edge = Edge(to_node, length)
        if from_node.label in self.edges:
            from_node_edges = self.edges[from_node.label]
        else:
            self.edges[from_node.label] = dict()
            from_node_edges = self.edges[from_node.label]
        from_node_edges[to_node.label] = edge


def min_dist(q, dist):
    """
    Returns the node with the smallest distance in q.
    Implemented to keep the main algorithm clean.
    """
    min_node = None
    for node in q:
        if min_node == None:
            min_node = node
        elif dist[node] < dist[min_node]:
            min_node = node

    return min_node


def dijkstra(graph, source):
    q = set()
    dist = {}
    prev = {}

    for v in graph.nodes:       # initialization
        dist[v] = INFINITY      # unknown distance from source to v
        prev[v] = INFINITY      # previous node in optimal path from source
        q.add(v)                # all nodes initially in q (unvisited nodes)

    # distance from source to source
    dist[source] = 0

    while q:
        # node with the least distance selected first
        u = min_dist(q, dist)

        q.remove(u)

        if u.label in graph.edges:
            for _, v in graph.edges[u.label].items():
                alt = dist[u] + v.length
                if alt < dist[v.to_node]:
                    # a shorter path to v has been found
                    dist[v.to_node] = alt
                    prev[v.to_node] = u

    return dist, prev


def to_array(prev, from_node):
    """Creates an ordered list of labels as a route."""
    previous_node = prev[from_node]
    route = [from_node.label]
    while previous_node != INFINITY:
        route.append(previous_node.label)
        temp = previous_node
        previous_node = prev[temp]

    route.reverse()
    return route


graph = Graph()

states = [
    '城北枢纽',
    '赞服国际机场',
    '出生点',
    '漆黑之翼',
    '未名阁',
    '中央枢纽'
]

node_a = Node('城北枢纽')
graph.add_node(node_a)
node_b = Node('赞服国际机场')
graph.add_node(node_b)
node_c = Node('出生点')
graph.add_node(node_c)
node_d = Node('漆黑之翼')
graph.add_node(node_d)
node_f = Node('未名阁')
graph.add_node(node_f)
node_g = Node('中央枢纽')
graph.add_node(node_g)

paths = [
    [node_a, node_b, 466],
    [node_b, node_a, 466],
    [node_b, node_c, 204],
    [node_c, node_b, 204],
    [node_c, node_d, 700],
    [node_d, node_c, 700],
    [node_f, node_c, 810],
    [node_c, node_f, 810],
    [node_c, node_g, 1277],
    [node_g, node_c, 127]
]

for f, t, d in paths:
    graph.add_edge(f, t, d)

dist, prev = dijkstra(graph, node_a)


print("从 {} 到 {} 的最短路径是 [{}] ，距离为 {}".format(
    node_a.label,
    node_g.label,
    " -> ".join(to_array(prev, node_g)),
    str(dist[node_g])
)
)
