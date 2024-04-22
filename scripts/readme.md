Model :

```mermaid
graph LR
A[Users] --> D{Images 8Mb} --> B((Avatar))
A --> B
A --> C(Posts)
A --> I[Comments]
C --> E{Images 16Mb}
C --> I
```
