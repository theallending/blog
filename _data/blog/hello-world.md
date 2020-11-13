---
template: BlogPost
path: /intro_small_area_estimation
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

The most common small area estimation method is the **basic area-level model**, which can be thought of as weighted average of a survey estimate and a regression synthetic estimate from a linear mixed regression model.

Let $\theta_i$ represent the population parameter of interest in domain $i$. Then, the survey estimate can be represented as:

$$
\begin{aligned}
\hat\theta_i &= \theta_i + e_i
\end{aligned}
$$

where:
- $e_i$'s are the sampling errors with $e_i \stackrel{ind}{\sim}(0, \psi_i)$.

The parameter of interest can also be linked to non-probabilistic data (commonly called **auxiliary data**) using a linear mixed regression model with the form:

$$
\begin{aligned}
\theta_i &= \bm{z_i^T}\bm\beta + b_iv_i
\end{aligned}
$$

where:
- $\bm{z_i}$ is a $p \times 1$ vector of covariates (from auxiliary data)
- $\bm{\beta} = (\beta_1, \dots, \beta_p)^T$ is a $p \times 1$ vector of regression coefficients
- $v_i$'s are domain-specific random effects with $v_i \stackrel{iid}{\sim}(0, \sigma^2_v)$
- $b_i$'s are known positive constants

The regression equation can be substituted into the equation for sampling estimate which results in the basic area-level model:

$$
\hat\theta_i = \bm{z_i^T}\bm\beta + b_iv_i + e_i
$$

This model was first used by R.E. Fay and R.A. Herriot in 1979 to estimate the per capita income in U.S. cities with population under 1,000.

The theory of Empirical Best Linear Unbiased Prediction (EBLUP) can be applied to the basic area-level model to derive estimates for $\bm{\beta}$ and $\sigma^2_v$. A brief summary of the EBLUP theory is given below. For more information, please refer to *Small Area Estimation* (2015) by J.N.K Rao and Isabel Molina.

#3 - Direct Estimation

###3.1 - Simulating Survey Estimates
```r
library(ggplot2)
library(dplyr)
#testing syntax highlighting
#not bad
normal_data <- rnorm(10000, 5, 20)
```

#4 -  Model-Based Estimation

###4.1 - Simulating Non-Probabilistic Data


###4.2 - Model Creation

#5 - Model Diagnostics
