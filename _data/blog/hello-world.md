---
template: BlogPost
path: /hello-world
date: 2020-11-10T10:00:50.137Z
title: Using Small Area Estimation Techniques to Reduce Survey Sample Sizes
thumbnail: ''
metaDescription: small area estimation
---

#1 - Introduction 

With the advent of the technological age, collecting data has never been easier. For example, social media companies can track their users' behaviour, mobile service providers can see how people move across geographies, and financial service companies can identify their clients' spending patterns. The sheer volume of data that is available at a person-level is shaping how entire industires evolve. 

However, the majority of this data is considered as **non-probabilistic** data, where it is not suitable for the direct use in forming inferences about the general population. **Probabilistic** data comes from probabilistic survey sampling, where the resultant sample is representative of the population of interest. Unfortunately, probabilistic survey sampling is expensive, time-consuming, and places a burden on the respondent while collecting non-probabilistic data is cheap, and can be collected without an individual even knowing.

Luckily, non-probabilistic data can be integrated with probabilistic data using **small area estimation** modelling techniques. By doing so, it can drastically increase the precision of the statistical estimates OR reduce the sample size needed to reach the same level of precision.

#2 - Small Area Estimation

$$
\begin{aligned}
\hat{\theta_i} &= \theta + e_i  \\
\theta_i &= \bm{z_i^T}\bm\beta + b_iv_i \\
\hat{\theta_i} &= \bm{z_i^T}\bm\beta + b_iv_i + e_i
\end{aligned}
$$

#3 - Direct Estimation

###3.1 - Simulating Survey Estimates

#4 -  Model-Based Estimation

###4.1 - Simulating Non-Probabilistic Data


###4.2 - Model Creation

#5 - Model Diagnostics
