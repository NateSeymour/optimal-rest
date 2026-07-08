terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    cloudinit = {
      source = "hashicorp/cloudinit"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "static" {
  bucket = "rest.seymour.global-static"

  tags = {
    Name = "Optimal Rest Static"
    Service = "Optimal Rest"
  }
}

resource "aws_s3_bucket_website_configuration" "main" {
  bucket = aws_s3_bucket.static.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.static.id

  block_public_acls = false
  block_public_policy = false
  ignore_public_acls = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "public_read" {
  statement {
    sid = "PublicReadGetObject"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.static.arn}/*",
    ]

    condition {
      test = "StringEquals"
      variable = "AWS:SourceArn"
      values = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.static.id
  policy = data.aws_iam_policy_document.public_read.json
}

data "aws_acm_certificate" "main" {
  region = "us-east-1"
  domain = "seymour.global"
  statuses = ["ISSUED"]
}

resource "aws_cloudfront_origin_access_control" "main" {
  name = "default-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior = "always"
  signing_protocol = "sigv4"
}

resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id   = "s3"
  }

  enabled = true
  is_ipv6_enabled = true
  default_root_object = "index.html"

  aliases = ["rest.seymour.global"]

  default_cache_behavior {
    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id       = "s3"
    viewer_protocol_policy = "allow-all"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  tags = {
    Name = "rest.seymour.global"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }
}

data "aws_route53_zone" "seymour_global" {
  name = "seymour.global"
}

resource "aws_route53_record" "hostname" {
  for_each = aws_cloudfront_distribution.main.aliases

  zone_id = data.aws_route53_zone.seymour_global.zone_id
  name = each.value
  type = "A"

  alias {
    name = aws_cloudfront_distribution.main.domain_name
    zone_id = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}
