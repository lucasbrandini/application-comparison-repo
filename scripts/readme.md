Model :

```mermaid
graph LR
A[Users] --> B((Avatar)) --> D{Images 8Mb}
A --> C(Posts)
A --> I[Comments]
C --> E{Images 16Mb}
C --> I
```
